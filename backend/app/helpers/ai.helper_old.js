import { encode } from "gpt-3-encoder";
import fetch from "node-fetch";
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import mammoth from "mammoth";
// import PDFParser from "pdf-parse";
import xlsx from "xlsx";
import fs from "fs";
import { CharacterTextSplitter } from "langchain/text_splitter";
// import { Pinecone } from "@pinecone-database/pinecone";
import { ObjectId } from "mongodb";

import * as dbHelper from "./db.helper.js";
import * as fileHelper from "./file.helper.js";
import * as pc from "./pinecone.helper.js";

import OpenAI from "openai";
import { FaqDoc } from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __tempDir = __dirname + "/assets/temp";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const splitter = new CharacterTextSplitter({
  chunkSize: 1536,
  chunkOverlap: 200,
});

export const countToken = (messages) => {
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
    // if (file) {
    //   await PDFParser(file)
    //     .then((data) => {
    //       context = data.text.trim() + "\n\n";
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    // } else if (path) {
    //   await fs.readFileSync(path, async (error, buffer) => {
    //     if (error) {
    //       console.error(error);
    //     }
    //     await PDFParser(buffer)
    //       .then((data) => {
    //         context = data.text.trim() + "\n\n";
    //       })
    //       .catch((error) => {
    //         console.error(error);
    //       });
    //   });
    // }
  }

  if (filename) {
    return `
${filename} ->
${context}`;
  }

  return context;
};

export const fetchContext = async (url) => {
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

export const getContext = async ({
  files = [],
  urls = [],
  content: rawCotent,
}) => {
  return new Promise(async (resolve, reject) => {
    let context = rawCotent + "";

    try {
      for (let i = 0; i < files?.length; i++) {
        const file = files[i];
        context +=
          (await fetchContext({
            filename: file.name,
            ext: file.url.replace(/.+\./, ""),
            path: __dirname + file.url,
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
      ...(["List Products", "Query Products"].includes(actionName)
        ? dbHelper.getDynamicPipeline({
            fields: collection.fields,
            business_id: business._id,
            table: "Product",
          })
        : []),
    ]);
  };
};

export const generateResponse = async (messages, metadata = {}) => {
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
              if (resp.action === "Query Products") {
                console.log(resp.parameters);
                const embedding = await openai.embeddings
                  .create({
                    model: "text-embedding-3-large",
                    input: `${resp.parameters.attributes}
Summary: ${resp.parameters.summary}`,
                    encoding_format: "float",
                  })
                  .then((data) => data.data[0].embedding);
                const vectors = await pc.query({
                  topK: 5,
                  vector: embedding,
                  ...(Object.keys(resp.parameters.metadata).length > 0 && {
                    filter: resp.parameters.metadata,
                  }),
                  includeMetadata: false,
                  includeValues: false,
                });
                if (!vectors?.length) {
                  resolve({
                    action: resp.action,
                    data: [],
                    message,
                    usage: completion.usage,
                  });
                }
                const action = await getAction(resp.action);
                console.log(vectors);
                const data = await action(metadata.business, [
                  {
                    $match: {
                      _id: { $in: vectors.map((v) => new ObjectId(v.id)) },
                    },
                  },
                ]).catch((err) => {
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
              } else {
                const action = await getAction(resp.action);
                if (action) {
                  if (resp.pipeline?.length) {
                    resp.pipeline = resp.pipeline.filter(
                      (item) => Object.keys(item).length > 0
                    );
                  }
                  console.log("generated pipeline -----> ", resp.pipeline);
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

export const getTopic = async ({ topics, message }) => {
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

export const removeVectors = async (ids) => {
  await pc.deleteVectors({ ids });
};

export const pushToPinecone = async ({
  metadata,
  oldVectorIds,
  files = [],
  urls = [],
}) => {
  if (oldVectorIds?.length) {
    await pc.deleteVectors({ ids: oldVectorIds });
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
        await pc.upsert({ vectors: batch });
        batch = [];
        vectorIds.push(...newIds);
        newIds = [];
      }
    }
  }
  await FaqDoc.findOneAndUpdate({ _id: metadata.topicId }, { vectorIds });
};

export const getPartialContext = async ({ userId, topicId, msg }) => {
  const queryEmbeddings = await openai
    .createEmbedding({
      model: "text-embedding-ada-002",
      input: msg,
    })
    .then((res) => res.data.data[0].embedding);
  const queryResponse = await pc.query({
    topK: 2,
    vector: queryEmbeddings,
    includeMetadata: true,
    // includeValues: false,
    filter: {
      userId,
      topicId,
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

export const addProductVector = async ({ product }) => {
  try {
    if (!product.title?.trim() || !product.description?.trim()) return;
    const existingVector = await pc
      .fetch([product._id.toString()])
      .catch((err) => console.log("fetch error", err));

    const messages = [
      {
        role: "user",
        name: "System",
        content: `You are an AI assistant here to help with summarizing product titles and descriptions into bullet points attributes. Also, include a 100 word summary of the whole description. Don't use markdonw, use plain text.
      
      Response structure should be like this:
      Title: <Product Title>
      Attributes:
      Type: Memory Foam Orthopedic Insoles
      Lightweight: Yes, does not add extra weight
      Color Options: Gray, Blue
(list as many attributes as possible up to 20)
Description: <Description Summary>`,
      },
      {
        role: "user",
        name: "Guest",
        content: `${Object.entries(product.toJSON())
          .filter(
            ([key]) =>
              ![
                "_id",
                "__v",
                "createdAt",
                "updatedAt",
                "images",
                "whatsappNumber",
              ].includes(key)
          )
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")}`,
      },
    ];
    const { message, usage } = await generateResponse(messages);
    const embedding = await openai.embeddings
      .create({
        model: "text-embedding-3-large",
        input: message.content,
        encoding_format: "float",
      })
      .then((data) => data.data[0].embedding);

    const metadata = Object.entries(product.toJSON())
      .filter(
        ([key]) =>
          ![
            "_id",
            "__v",
            "createdAt",
            "updatedAt",
            "images",
            "whatsappNumber",
            "description",
          ].includes(key)
      )
      .reduce((p, [k, v]) => {
        p[k] = v;
        return p;
      }, {});

    if (existingVector.length) {
      await pc
        .update({
          id: product._id.toString(),
          values: embedding,
          setMetadata: metadata,
        })
        .then((data) => {
          console.log("vector updated", data);
        });
    } else {
      await pc
        .upsert({
          vectors: [
            {
              id: product._id.toString(),
              values: embedding,
              metadata,
            },
          ],
        })
        .then((data) => {
          console.log("vector saved", data);
        });
    }
    // console.log("bullet points", embedding);
  } catch (err) {
    console.log(err);
  }
};

export const deleteProductVector = async ({ ids }) => {
  try {
    await pc.deleteVectors({ ids });
  } catch (err) {
    console.log(err);
  }
};
