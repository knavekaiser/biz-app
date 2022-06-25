const multer = require("multer");
const {
  appConfig: { responseFn, responseStr },
} = require("../config");
const fs = require("fs");

const path = require("path");

const dist = "/assets/uploads/";
const uploadDir = __dirname.replace(/(\\|\/)app.*/, "") + dist;

const upload = (fields, uploadPath, options) => {
  const multiple = typeof fields === "object";
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir + uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `${req.authUser?._id || Date.now()}_${file.fieldname}${
        options.override ? ".png" : ext
      }`;

      cb(null, fileName);
    },
  });
  let upload = multer({
    storage,
    limits: { fileSize: (options?.fileSize || 10) * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (options?.fileTypes) {
        if (options.fileTypes.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            responseStr.unsupported_file_type.replace(
              "{fileTypes}",
              `${options.fileTypes}`.replace(/\/|\//g, "").split("|").join(", ")
            ),
            false
          );
        }
      } else {
        cb(null, true);
      }
    },
  });

  upload = multiple ? upload.fields(fields) : upload.single(fields);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (req.files) {
        Object.entries(req.files).forEach(([fieldname, [file]]) => {
          req.body[fieldname] = dist + file.filename;
        });
      }
      if (req.file) {
        req.body[req.file.fieldname] = dist + req.file.filename;
      }
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE")
          return responseFn.error(
            res,
            {},
            responseStr.file_too_large.replace(
              "{maxSize}",
              `${options.fileSize || 10}MB`
            )
          );
        return responseFn.error(res, {}, err?.message);
      }
      next();
    });
  };
};

module.exports = { upload };
