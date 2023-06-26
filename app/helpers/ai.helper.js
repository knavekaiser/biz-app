const { encode } = require("gpt-3-encoder");
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mammoth = require("mammoth");
const PDFParser = require("pdf-parse");
const fs = require("fs");

const fileHelper = require("./file.helper");

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

const readContext = async ({ ext, path, file }) => {
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

const getContext = async ({ files = [], urls = [] }) => {
  return new Promise(async (resolve, reject) => {
    let context = "";

    try {
      for (let i = 0; i < files?.length; i++) {
        const file = files[i];
        context +=
          (await readContext({
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

module.exports = {
  countToken,
  fetchContext,
  getContext,
  generateResponse,
};
