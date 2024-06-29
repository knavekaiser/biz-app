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
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

import * as dbHelper from "./db.helper.js";
import * as pc from "./pinecone.helper.js";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone();
const pcIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// ----------------------------------------- Actions

const getProducts = new DynamicStructuredTool({
  name: "get_products",
  description: `This function will return a list of products from the mongodb database.
You will generate attributes from the user's query, which will then be vectorized. These vectors will be queried and ranked against a Pinecone vector database containing similar bullet points, with each vector corresponding to one product. If you notice that the user is looking for a product for which we have a dedicated category or subcategory, you will include that category or subcategory, as well as any other relevant parameters, in a metadata filter.`,
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
          .object({})
          .describe("Extra filters like category, subcategory etc."),
      })
      .optional()
      .describe(
        "This is an optional field that will filter products by matching vectors."
      ),
    pipeline: z
      .array(
        z
          .object({})
          .optional()
          .describe(
            "Mongodb aggregation pipeline stage. Never pass an empty object."
          )
      )
      .describe("Mongodb aggregation pipeline. This can be empty."),
  }),
  func: async ({ vectorSearch, business_id, pipeline = [] }) => {
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
    const { Model, collection } = await dbHelper.getModel(
      business_id + "_" + "Product"
    );
    const wholePipeline = [
      ...(_ids ? [_ids] : []),
      ...pipeline,
      ...dbHelper.getDynamicPipeline({
        fields: collection.fields,
        business_id,
        table: "Product",
      }),
    ];
    const products = await Model.aggregate(wholePipeline);
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

      for await (const event of eventStream) {
        const eventType = event.event;
        if (eventType === "on_chain_start") {
          // Was assigned when creating the agent with `.withConfig({"runName": "Agent"})` above
          if (event.name === "Agent") {
            console.log("\n-----");
            console.log(
              `Starting agent: ${event.name} with input: ${JSON.stringify(
                event.data.input
              )}`
            );
          }
        } else if (eventType === "on_chain_end") {
          // Was assigned when creating the agent with `.withConfig({"runName": "Agent"})` above
          if (event.name === "Agent") {
            console.log("\n-----");
            console.log(`Finished agent: ${event.name}\n`);
            console.log(`Agent output was: ${event.data.output}`);
            console.log("\n-----");
          }
        } else if (eventType === "on_llm_stream") {
          const content = event.data?.chunk?.message?.content;
          // Empty content in the context of OpenAI means
          // that the model is asking for a tool to be invoked via function call.
          // So we only print non-empty content
          if (content !== undefined && content !== "") {
            resolve({ output: content });
          }
        } else if (eventType === "on_tool_start") {
          console.log("\n-----");
          console.log(
            `Starting tool: ${event.name} with inputs: ${event.data.input}`
          );
        } else if (eventType === "on_tool_end") {
          console.log("\n-----");
          console.log(`Finished tool: ${event.name}\n`);
          console.log(`Tool output was: ${event.data.output}`);
          console.log("\n-----");
        }
      }
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
