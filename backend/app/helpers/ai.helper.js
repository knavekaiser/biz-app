import { encode } from "gpt-3-encoder";
import { ObjectId } from "mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import {
  createOpenAIFunctionsAgent,
  createToolCallingAgent,
} from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { CharacterTextSplitter } from "langchain/text_splitter";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import xlsx from "xlsx";
// import PDFParser from "pdf-parse";

import * as dbHelper from "./db.helper.js";
import * as pc from "./pinecone.helper.js";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const splitter = new CharacterTextSplitter({
  chunkSize: 1536,
  chunkOverlap: 200,
});

const pinecone = new Pinecone();
const pcIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// ----------------------------------------- Actions

const getProducts = new DynamicStructuredTool({
  name: "get_products",
  description: `This function will return a list of products from the mongodb database.
For vectorSearch: You will generate attributes from the user's query, which will then be vectorized. These vectors will be queried and ranked against a Pinecone vector database containing similar bullet points, with each vector corresponding to one product. If you notice that the user is looking for a product for which we have a dedicated category or subcategory, you will include that category or subcategory, as well as any other relevant parameters, in a metadata filter.`,
  schema: z.object({
    business_id: z.string().describe("ID of the business."),
    vectorSearch: z
      .object({
        query: z.object({
          attributes: z
            .string()
            .describe(
              "A list of attributes that will be turned into embeddings."
            ),
          summary: z
            .string()
            .describe(
              "A small summary of the product the user is looking for."
            ),
        }),
        metadata: z
          .object({
            price: z
              .object({
                $eq: z.number().optional(),
                $ne: z.number().optional(),
                $gt: z.number().optional(),
                $gte: z.number().optional(),
                $lt: z.number().optional(),
                $lte: z.number().optional(),
                $in: z.number().optional(),
                $nin: z.number().optional(),
                $exists: z.number().optional(),
              })
              .optional()
              .describe(
                "Include this field if the user is asking for products within specific range. the key can be one of $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $exists. and the value should be the number user provided."
              ),
            category: z.string().optional(),
            subcategory: z.string().optional(),
          })
          .optional()
          .describe(
            "Include this field if the user asks for products from a specific category, subcategory, etc."
          ),
      })
      .optional()
      .describe(
        "This is an optional field that will filter products by matching vectors."
      ),
  }),
  func: async ({ vectorSearch, business_id, fin_period_id, pipeline = [] }) => {
    let _ids = null;
    if (vectorSearch) {
      const embedding = await openai.embeddings
        .create({
          model: "text-embedding-3-large",
          input: `${vectorSearch.query?.attributes}
Summary: ${vectorSearch.query?.summary}`,
          encoding_format: "float",
        })
        .then((data) => data.data[0].embedding);
      const vectors = await pc.query({
        topK: 5,
        vector: embedding,
        ...(Object.keys(vectorSearch.metadata).length > 0 && {
          filter: vectorSearch.metadata,
        }),
        includeMetadata: false,
        includeValues: false,
      });
      if (vectors.length) {
        _ids = {
          $match: {
            _id: { $in: vectors.map((v) => new ObjectId(v.id)) },
          },
        };
      }
    }
    const { Model, collection } = await dbHelper.getModel({
      companyId: business_id,
      finPeriodId: fin_period_id,
      name: "Product",
    });
    const wholePipeline = [
      // ...(_ids ? [_ids] : []),
      // ...pipeline,
      { $limit: 5 },
      ...dbHelper.getDynamicPipeline({
        fields: collection.fields,
        business_id,
        table: "Product",
      }),
      { $project: { description: 0 } },
    ];
    console.log(pipeline);
    const products = await Model.aggregate(wholePipeline).catch((err) => {
      console.log("llm action err: getProduct - ", err.message);
      return [];
    });
    // console.log("products found", products.length);
    return JSON.stringify(products);
  },
});

// ----------------------------------------- Prompt

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.2,
  apiKey: process.env.OPENAI_API_KEY,
});
const tools = [getProducts];
const prompts = ChatPromptTemplate.fromMessages([
  // ["system", "{system_prompt}"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);
const agent = await createOpenAIFunctionsAgent({
  llm,
  tools,
  prompt: prompts,
});
const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __tempDir = __dirname + "/assets/temp";

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
  if (true || new RegExp(/\.(pdf|docx|txt|xlsx|html|json)$/i).test(url)) {
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
      for (const file of files) {
        const { error, content } = await fetchContext(
          process.env.CLOUDFLARE_S3_PUBLIC_URL + file.url
        );
        if (error) throw new Error(error);
        context += content + "\n\n";
      }
      for (const url of urls.filter(Boolean)) {
        const { error, content } = await fetchContext(url);
        if (error) throw new Error(error);
        context += content + "\n\n";
      }

      resolve(context);
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

export const countToken = (messages) => {
  const encoded = encode(messages);
  return encoded.length;
};

export const generateResponse = async ({
  history,
  message,
  stream,
  metadata = {},
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (stream) {
        const eventStream = await agentExecutor.streamEvents(
          {
            // system_prompt: '',
            chat_history: history?.map((m) => {
              if (m.role === "system") {
                return new SystemMessage(m.content);
              }
              if (m.role === "user") {
                return new HumanMessage(m.content);
              }
              if (m.role === "assistant") {
                return new AIMessage(m.content);
              }
            }),
            input: message,
          },
          { version: "v1" }
        );
        return resolve(eventStream);
      } else {
        const result = await agentExecutor.invoke({
          // system_prompt: '',
          chat_history: history?.map((m) => {
            if (m.role === "system") {
              return new SystemMessage(m.content);
            }
            if (m.role === "user") {
              return new HumanMessage(m.content);
            }
            if (m.role === "assistant") {
              return new AIMessage(m.content);
            }
          }),
          input: message,
        });
        // console.log(result);
        return resolve(result);
      }
    } catch (err) {
      reject(err);
    }
  });
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
    const { message, usage } = await generateResponse(messages).catch((err) => {
      return {};
    });

    const embedding = message
      ? await openai.embeddings
          .create({
            model: "text-embedding-3-large",
            input: message.content,
            encoding_format: "float",
          })
          .then((data) => data.data[0].embedding)
          .catch((err) => console.log("embedding error ==>", err.message))
      : null;

    if (embedding) {
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
    }
  } catch (err) {
    console.log("======>", err);
  }
};

export const deleteProductVector = async ({ ids }) => {
  try {
    await pc.deleteVectors({ ids });
  } catch (err) {
    console.log(err);
  }
};

export const pushToPinecone = async ({
  FaqDoc,
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
    const embeddings = await openai.embeddings
      .create({
        model: "text-embedding-ada-002",
        input: chunks.map((item) => item.pageContent.replace(/\n/g, " ")),
      })
      .then((res) => res.data.map((item) => item.embedding))
      .catch((err) => console.log("embedding error ==>", err.message));

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
