const { appConfig } = require("../config");
const fs = require("fs");

const uploadDir = __dirname.replace(/(\\|\/)app.*/, "") + appConfig.uploadDir;

exports.deleteFiles = (paths) => {
  if (Array.isArray(paths)) {
    paths.forEach((path) => {
      fs.unlink(uploadDir + path.replace(appConfig.uploadDir, ""), (err) => {
        // store reminder to remove this file later
      });
    });
  } else {
    fs.unlink(uploadDir + paths.replace(appConfig.uploadDir, ""), (err) => {
      // store reminder to remove this file later
    });
  }
};
