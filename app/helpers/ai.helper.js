const { encode } = require("gpt-3-encoder");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mammoth = require("mammoth");
const PDFParser = require("pdf-parse");
const xlsx = require("xlsx");
const fs = require("fs");
const { CharacterTextSplitter } = require("langchain/text_splitter");
// const pinecone = require("@pinecone-database/pinecone");
const { ObjectId } = require("mongodb");
const dbHelper = require("./db.helper");

const fileHelper = require("./file.helper");

const OpenAI = require("openai");
const { FaqDoc } = require("../models");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const splitter = new CharacterTextSplitter({
  chunkSize: 1536,
  chunkOverlap: 200,
});

// const pcIndexName = process.env.PINECONE_INDEX_NAME; // "infinai-chat-context";
let pcIndex = null;
// setTimeout(async () => {
//   try {
//     const pc = new Pinecone(process.env.PINECONE_API_KEY);
// pineconeIndex = pc.Index(pineconeIndexName);
// const indexesList = await pc.describeIndex(pcIndexName);
// console.log(pcIndexName, indexesList);
// await pinecone.deleteIndex({
//   indexName: pineconeIndexName,
// });
// if (!indexesList.includes(pcIndexName)) {
// await pc
//   .createIndex({
//     createRequest: {
//       name: pineconeIndexName,
//       dimension: 1536,
//       metric: "cosine",
//       metadataConfig: {
//         indexed: ["_id"],
//       },
//       spec: {
//         serverless: {
//           cloud: "aws",
//           region: "us-east-1",
//         },
//       },
//     },
//   })
//   .then((newIndex) => {
//     console.log(newIndex);
//   });
// }
//   } catch (err) {
//     console.log("pinecone error", err);
//   }
// }, 1000);

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

const getAction = async (actionName) => {
  return async (business, pipeline = []) => {
    const { Model, collection } = await dbHelper.getModel(
      business._id + "_" + "Product"
    );
    return Model.aggregate([
      ...pipeline,
      ...(actionName === "List Products"
        ? dbHelper.getDynamicPipeline({
            fields: collection.fields,
            business_id: business._id,
            table: "Product",
          })
        : []),
    ]);
  };
};

const generateResponse = async (messages, metadata = {}) => {
  return new Promise(async (resolve, reject) => {
    await openai.chat.completions
      .create({
        model: "gpt-4o",
        messages,
        // max_tokens,
      })
      .then(async (completion) => {
        const message = completion.choices[0]?.message;
        if (message.content.includes(`"response_type": "action"`)) {
          try {
            message.content = JSON.stringify(JSON.parse(message.content));
          } catch (err) {
            console.log("fixing prompt", message.content);
            if (
              message.content.startsWith("```json") &&
              message.content.endsWith("```")
            ) {
              message.content = message.content
                .replace("```json", "")
                .replace("```", "")
                .trim();
            } else {
              const json = message.content
                .match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/gm)
                ?.map(JSON.parse);
              if (json) {
                console.log("fixed json", json);
                message.content = JSON.stringify(json?.[0] || json);
              }
            }
          }
        }
        if (
          message?.content?.startsWith("{") &&
          message?.content?.endsWith("}")
        ) {
          try {
            console.log("raw", message.content);
            let resp = {};
            try {
              resp = JSON.parse(message.content);
            } catch (err) {
              const fixPrompt = `Have a look at the following JSON. Check if there's any mistake. Please fix the problems and return the fixed JSON. If there aren't any problems, Just return the JSON. respond with JSON only. don't include anything else.`;
              resp = await openai.chat.completions
                .create({
                  model: "gpt-4o",
                  messages: [
                    {
                      role: "user",
                      name: "System",
                      content: fixPrompt,
                    },
                    {
                      role: "user",
                      name: "System",
                      content: `Todays Date: ${new Date().toISOString()}`,
                    },
                    {
                      role: "user",
                      name: "Guest",
                      content: message.content,
                    },
                  ],
                })
                .then((completion) =>
                  JSON.parse(completion.choices[0].message.content)
                )
                .catch((err) => {
                  console.log("Error occurred when fixing JSON: ", err.message);
                  return {};
                });
            }
            console.log("parsed", resp);
            if (resp.response_type === "action") {
              const action = await getAction(resp.action);
              if (action) {
                if (resp.pipeline?.length) {
                  resp.pipeline = resp.pipeline.filter(
                    (item) => Object.keys(item).length > 0
                  );
                }
                console.log("generated pipeline -> ", resp.pipeline);
                const data = await action(
                  metadata.business,
                  resp.pipeline
                ).catch((err) => {
                  console.log(`Error occured on action: ${err.message}`);
                  return [];
                });
                console.log("data ----------->", data?.length);
                resolve({
                  action: resp.action,
                  data,
                  message,
                  usage: completion.usage,
                });
              }
            } else if (resp.response_type === "text") {
              resolve({
                message: resp.message,
                usage: completion.usage,
              });
            }
          } catch (err) {
            console.log(err);
            resolve({
              message: {
                role: "system",
                content: "Something went wrong when performing the action.",
              },
              usage: completion.usage,
            });
          }
        }
        resolve({
          message,
          usage: completion.usage,
        });
      })
      .catch((err) => {
        console.log(err?.message);
        reject(err?.response?.data || err.message);
      });
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
  await pcIndex.delete1({ ids });
};

const pushToPinecone = async ({
  metadata,
  oldVectorIds,
  files = [],
  urls = [],
}) => {
  if (oldVectorIds?.length) {
    await pcIndex.delete1({ ids: oldVectorIds });
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
        await pcIndex.upsert({ upsertRequest: { vectors: batch } });
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
  const queryResponse = await pcIndex.query({
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
