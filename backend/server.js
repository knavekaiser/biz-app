import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import sharp from "sharp";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

import "dotenv/config";

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use((req, res, next) => {
  ["query", "body", "params"].forEach((data) => {
    req[data] = Object.entries(req[data]).reduce(
      (p, [key, value]) => ({
        ...p,
        [key]: typeof value === "string" ? value.trim() : value,
      }),
      {}
    );
  });
  next();
});

import routes from "./app/routes/index.js";
routes(app);

// simple route
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Biz App API." });
});

app.get("/assets/*/:file", (req, res) => {
  const filepath =
    __dirname + "/assets/" + req.params[0] + "/" + req.params.file;
  if (fs.existsSync(filepath)) {
    if (/\.(png|jpg|jpeg|webp)$/.test(filepath)) {
      const { h, w } = req.query;
      res.type("webp");
      res.set("Cache-Control", `public, max-age=${3600 * 1}`); // 1 hour

      const imageSharp = sharp(filepath);

      if (+h && +w) {
        imageSharp.resize(+w, +h).toFormat("webp");
      } else if (+h) {
        imageSharp.resize(null, +h).toFormat("webp").rotate();
      } else if (+w) {
        imageSharp.resize(+w, null).toFormat("webp").rotate();
      }

      const resizedImageStream = imageSharp.pipe(res);

      resizedImageStream.on("error", (error) => {
        console.error("Error sending resized image:", error);
        res.sendStatus(500);
      });
    } else {
      res.sendFile(filepath);
    }
  } else {
    res.status(404).json("File not found");
  }
});

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
);

const PORT = process.env.PORT || 8060;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
