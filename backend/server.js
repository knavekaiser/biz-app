const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");

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

require("./app/routes")(app);

// simple route
app.get("/api", (req, res) => {
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

app.use(express.static(path.join(__dirname, "client")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/index.html"))
);

const PORT = process.env.PORT || 8060;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
