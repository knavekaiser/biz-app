const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { FaqDoc, Chat } = require("../models");

const { Configuration, OpenAIApi } = require("openai");
const mammoth = require("mammoth");
const PDFParser = require("pdf-parse");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
const { fileHelper } = require("../helpers");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.getTopics = async (req, res) => {
  try {
    const topics = await FaqDoc.find({ user_id: req.business?._id || null });

    responseFn.success(res, { data: topics.map((item) => item.topic) });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

const getContext = async ({ ext, path, file }) => {
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

  return context;
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
const fetchContext = async (url) => {
  let topic, content;
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
            content = await getContext({
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
      content = await getContext({
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
  return { topic, content };
};

exports.initChat = async (req, res) => {
  try {
    if (!req.body.topic && !req.body.url) {
      return responseFn.error(res, {}, responseStr.include_either_topic_or_url);
    }

    // get text content from documents
    let context = "";
    let topic = "";
    let error = "";

    if (req.body.topic) {
      const doc = await FaqDoc.findOne({ topic: req.body.topic });
      topic = doc.topic;

      for (let i = 0; i < doc.files?.length; i++) {
        const file = doc.files[i];
        context +=
          (await getContext({
            ext: file.url.replace(/.+\./, ""),
            path: __appDir + file.url,
          })) + "\n\n";
      }
      for (let i = 0; i < doc.urls?.length; i++) {
        const url = doc.urls[i];

        const result = await fetchContext(url);
        context += result.content + "\n\n";
      }
    } else if (req.body.url) {
      const result = await fetchContext(req.body.url);
      topic = result.topic;
      context = result.content;
    }

    if (!context.trim().length) {
      return responseFn.error(res, {}, error);
    }

    const message = `You are an AI assistant here to help with ${topic} FAQs. You are equipped with knowledge about ${topic} to provide you with accurate answers. If the question is not related to ${topic}, You will politely ask if I can help you with ${topic}. If your question is about ${topic}, You will use the context to answer the query. In case the initial context doesn't cover the question, You will respond with "Sorry, I don't have the information you're looking for. Is there anything else I can assist you with?". and keep the answers concise.

Context: ${context}`;

    const messages = [
      { role: "user", name: "System", content: message },
      {
        role: "user",
        name: "Guest",
        content: req.body.message,
      },
    ];

    const completion = await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo-16k", //"gpt-3.5-turbo-0301",
        messages,
        max_tokens: 100,
      })
      .catch((err) => console.log(err?.response.data));

    if (completion?.data?.id) {
      messages.push(completion.data.choices[0]?.message);
      const chat = await new Chat({
        topic,
        url: req.body.url,
        user: {
          name: req.body.name,
          email: req.body.email,
        },
        messages,
      }).save();
      return responseFn.success(res, {
        data: {
          _id: chat._id,
          user: chat.user,
          topic: chat.topic,
          messages: chat.messages.filter((item) => item.name !== "System"),
        },
      });
    }

    responseFn.error(res, {});
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.getChat = async (req, res) => {
  try {
    Chat.findOne({ _id: req.params._id })
      .then((chat) =>
        responseFn.success(res, {
          data: {
            _id: chat._id,
            user: chat.user,
            topic: chat.topic,
            messages: chat.messages.filter((item) => item.name !== "System"),
          },
        })
      )
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params._id });

    const completion = await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo-16k", //"gpt-3.5-turbo-0301",
        messages: [
          ...chat.messages.map((item) => ({
            role: item.role,
            name: item.name,
            content: item.content,
          })),
          {
            role: "user",
            name: "Guest",
            content: req.body.content,
          },
        ],
        max_tokens: 100,
      })
      .catch((err) => console.log(err?.response.data));

    if (completion?.data?.id) {
      const message = completion.data.choices[0]?.message;
      await Chat.updateOne(
        { _id: req.params._id },
        {
          $push: {
            messages: {
              $each: [
                {
                  role: "user",
                  name: "Guest",
                  content: req.body.content,
                },
                message,
              ],
            },
          },
        }
      );
      return responseFn.success(res, { data: message });
    }

    responseFn.error(res, {});
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.vote = async (req, res) => {
  try {
    Chat.updateOne(
      {
        _id: req.params.chat_id,
        "messages._id": req.params.message_id,
      },
      { $set: { "messages.$.like": req.body.like } }
    )
      .then((data) => {
        if (data.modifiedCount) {
          return responseFn.success(res, {});
        }

        return responseFn.error(res, {}, responseStr.record_not_found);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
