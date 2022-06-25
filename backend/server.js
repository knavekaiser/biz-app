const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import db from "./app/models/index.js";

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

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Infin AI API." });
});

const fs = require("fs");
app.get("/assets/*/:file", (req, res) => {
  const filepath =
    __dirname + "/assets/" + req.params[0] + "/" + req.params.file;
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json("File not found");
  }
});

//*************************************************** */
require("./app/routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8060;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
