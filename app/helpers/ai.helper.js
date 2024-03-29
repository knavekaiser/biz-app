const { encode } = require("gpt-3-encoder");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mammoth = require("mammoth");
const PDFParser = require("pdf-parse");
const xlsx = require("xlsx");
const fs = require("fs");
const { CharacterTextSplitter } = require("langchain/text_splitter");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { ObjectId } = require("mongodb");

const fileHelper = require("./file.helper");

const { Configuration, OpenAIApi } = require("openai");
const { FaqDoc } = require("../models");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const splitter = new CharacterTextSplitter({
  chunkSize: 1536,
  chunkOverlap: 200,
});
const pineconeIndexName = process.env.PINECONE_INDEX_NAME; // "infinai-chat-context";
const pinecone = new PineconeClient();
let pineconeIndex = null;
pinecone
  .init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  })
  .then(async (res) => {
    pineconeIndex = pinecone.Index(pineconeIndexName);
    const indexesList = await pinecone.listIndexes();
    // await pinecone.deleteIndex({
    //   indexName: pineconeIndexName,
    // });
    if (!indexesList.includes(pineconeIndexName)) {
      await pinecone.createIndex({
        createRequest: {
          name: pineconeIndexName,
          dimension: 1536,
          // metadataConfig: {
          //   indexed: ["color"],
          // },
        },
      });
    }
  });

const countToken = (messages) => {
  const encoded = encode(messages);
  return encoded.length;
};

const parseHtml = async (url, html) => {
  try {
    const $ = cheerio.load(html);
    let bodyText = $("body")
      .html()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s{4}/gi, "\t")
      .replace(/\t+\s/gi, "\n");
    // .replace(/\s{2,}/gi, " ");

    return cheerio.load(bodyText).text().trim();
  } catch (err) {
    console.log(err);
  }
};

const readContext = async ({ filename, ext, path, file }) => {
  let context = "";

  if (ext === "docx") {
    await mammoth
      .extractRawText({ ...(path && { path }), ...(file && { buffer: file }) })
      .then((result) => {
        context = result.value.trim() + "\n\n";
      })
      .catch((error) => {
        console.error(error);
      });
  } else if (ext === "xlsx") {
    const workbook = path
      ? xlsx.readFile(path)
      : xlsx.read(file, { type: "buffer" });
    let workbook_sheet = workbook.SheetNames;
    context = JSON.stringify(
      xlsx.utils.sheet_to_json(workbook.Sheets[workbook_sheet[0]], {
        // Custom cell format parsers for date, time, and datetime columns
        dateNF: "dd-mm-yyyy",
        cellDates: true,
        cellStyles: true,
        raw: false,

        // Function to parse time (hh:mm) columns
        cellDates: true,
        cellStyles: true,
        raw: false,

        // Function to parse datetime (DD-MM-YYYY hh:mm) columns
        cellDates: true,
        cellStyles: true,
        raw: false,
        strip: false,
        dateNF: "dd-mm-yyyy hh:mm",
      })
    );
  } else if (ext === "txt") {
    if (file) {
      context = file.toString().trim() + "\n\n";
    } else if (path) {
      await fs.readFileSync(path, "utf8", (err, data) => {
        if (err) {
          console.error(err);
        }

        context = data.toString().trim() + "\n\n";
      });
    }
  } else if (ext === "pdf") {
    if (file) {
      await PDFParser(file)
        .then((data) => {
          context = data.text.trim() + "\n\n";
        })
        .catch((error) => {
          console.error(error);
        });
    } else if (path) {
      await fs.readFileSync(path, async (error, buffer) => {
        if (error) {
          console.error(error);
        }

        await PDFParser(buffer)
          .then((data) => {
            context = data.text.trim() + "\n\n";
          })
          .catch((error) => {
            console.error(error);
          });
      });
    }
  }

  if (filename) {
    return `
${filename} ->
${context}`;
  }

  return context;
};

const fetchContext = async (url) => {
  let topic, content, error;
  if (true || new RegExp(/\.(pdf|docx)$/i).test(url)) {
    await fetch(url)
      .then(async (res) => {
        if (res.status === 200) {
          const contentType = res.headers.get("content-type");
          topic = url.replace(/.*\//, "");
          if (contentType.includes("text/html")) {
            content = await parseHtml(res.url, await res.text());
          } else if (contentType.includes("text/plain")) {
            content = await res.text();
          } else if (contentType.startsWith("application/")) {
            const file = await res.arrayBuffer();
            content = await readContext({
              ext: url.replace(/.+\./, ""),
              file,
            });
          }
        } else {
          error = `Request failed with ${res.status}`;
        }
      })
      .catch((err) => {
        error = err.message;
      });
    if (!topic) {
      topic = url;
    }
  } else {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page._client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: __tempDir,
    });
    await page.goto(url, { waitUntil: "networkidle0" });

    const download = await page.waitForDownload();
    const mimeType = download.headers["content-type"];

    if (mimeType) {
      const filePath = download.suggestedFilename;
      // extract the content
      content = await readContext({
        ext: filePath.replace(/.+\./, ""),
        file: filePath,
      });

      // delete file
      await fileHelper.deleteFiles(filePath);
    } else if (mimeType) {
      content = await parseHtml(res.url, await page.content());
    }

    topic = (await page.title()) || url.replace(/.*\//, "");
    await browser.close();
  }

  return { topic, error, content };
};

const getContext = async ({ files = [], urls = [], content: rawCotent }) => {
  return new Promise(async (resolve, reject) => {
    let context = rawCotent + "";

    try {
      for (let i = 0; i < files?.length; i++) {
        const file = files[i];
        context +=
          (await readContext({
            filename: file.name,
            ext: file.url.replace(/.+\./, ""),
            path: __appDir + file.url,
          })) + "\n\n";
      }
      for (let i = 0; i < urls?.length; i++) {
        const url = urls[i];

        const { error, content } = await fetchContext(url);
        if (error) throw new Error(error);
        context += content + "\n\n";
      }

      resolve(context);
    } catch (err) {
      reject(err);
    }
  });
};

const generateResponse = async (messages, max_tokens = 100) => {
  return new Promise(async (resolve, reject) => {
    await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo-16k", //"gpt-3.5-turbo-0301",
        messages,
        max_tokens,
      })
      .then((completion) => {
        resolve({
          message: completion.data.choices[0]?.message,
          usage: completion.data.usage,
        });
      })
      .catch((err) => reject(err?.response.data));
  });
};

const getTopic = async ({ topics, message }) => {
  if (topics.length <= 1) {
    return topics[0]?.topic || null;
  }
  const messages = [
    {
      role: "user",
      name: "system",
      content: `Identify the most suitable topic for a given message from a list. If the message doesn't match any topic, respond with the most general topic from the list. respond with only the topic itself, no extra text whatsoever.

topics: ${topics.map((item) => item.topic).join(", ")}
question: ${message}`,
    },
  ];
  const _topic = await generateResponse(messages).then(
    (res) => res.message.content
  );
  return (
    topics.find((t) => _topic.toLowerCase().includes(t.topic.toLowerCase()))
      ?.topic ||
    topics[0]?.topic ||
    null
  );
};

const removeVectors = async (ids) => {
  await pineconeIndex.delete1({ ids });
};

const pushToPinecone = async ({
  metadata,
  oldVectorIds,
  files = [],
  urls = [],
}) => {
  if (oldVectorIds?.length) {
    await pineconeIndex.delete1({ ids: oldVectorIds });
  }
  const vectorIds = [];
  for (let i = 0; i < files.length + urls.length; i++) {
    const item = [...files, ...urls][i];
    const context = await getContext({
      [typeof item === "string" ? "urls" : "files"]: [item],
    });
    const chunks = await splitter.createDocuments([context]);
    const embeddings = await openai
      .createEmbedding({
        model: "text-embedding-ada-002",
        input: chunks.map((item) => item.pageContent.replace(/\n/g, " ")),
      })
      .then((res) => res.data.data.map((item) => item.embedding));

    const batchsize = 100;
    let batch = [];
    let newIds = Array.from({ length: chunks.length }, () => ObjectId());
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      batch.push({
        id: newIds[i],
        values: embeddings[i],
        metadata: {
          ...metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
        },
      });

      if (batch.length === batchsize || i === chunks.length - 1) {
        await pineconeIndex.upsert({ upsertRequest: { vectors: batch } });
        batch = [];
        vectorIds.push(...newIds);
        newIds = [];
      }
    }
  }
  await FaqDoc.findOneAndUpdate({ _id: metadata.topicId }, { vectorIds });
};

const getPartialContext = async ({ userId, topicId, msg }) => {
  const queryEmbeddings = await openai
    .createEmbedding({
      model: "text-embedding-ada-002",
      input: msg,
    })
    .then((res) => res.data.data[0].embedding);
  const queryResponse = await pineconeIndex.query({
    queryRequest: {
      topK: 2,
      vector: queryEmbeddings,
      includeMetadata: true,
      // includeValues: false,
      filter: {
        userId,
        topicId,
      },
    },
  });
  const context = queryResponse.matches
    .map((match) => match.metadata.pageContent)
    .join(" ");

  return [
    {
      role: "user",
      name: "System",
      content: `Context:
  ${context}`,
    },
    {
      role: "user",
      name: "Guest",
      content: msg,
    },
  ];
};

module.exports = {
  countToken,
  fetchContext,
  getContext,
  generateResponse,
  getTopic,
  pushToPinecone,
  getPartialContext,
  removeVectors,
};
