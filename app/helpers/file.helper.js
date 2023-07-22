const { appConfig } = require("../config");
const fs = require("fs");

const uploadDir = __dirname.replace(/(\\|\/)app.*/, "") + appConfig.uploadDir;
const pathRegx = new RegExp(`.*(\\\\|\/)assets(\\\\|\/)uploads`); // detects everything up until /assets/uplods

exports.deleteFiles = (paths) => {
  if (Array.isArray(paths)) {
    paths.forEach((path) => {
      fs.unlink(uploadDir + path.replace(pathRegx, ""), (err) => {
        console.log(err);
        // store reminder to remove this file later
      });
    });
  } else {
    fs.unlink(uploadDir + paths.replace(pathRegx, ""), (err) => {
      // store reminder to remove this file later
    });
  }
};
