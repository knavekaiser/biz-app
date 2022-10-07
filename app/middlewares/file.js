const multer = require("multer");
const {
  appConfig: { responseFn, responseStr, ...appConfig },
} = require("../config");
const Collection = require("../models/collection.model");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");

const uploadDir = __dirname.replace(/(\\|\/)app.*/, "") + appConfig.uploadDir;
const getPath = (str) =>
  str
    .replace(/\\/g, "/")
    .replace(new RegExp(`.*(?=${appConfig.uploadDir})`, "gi"), "");

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
          req.body[fieldname] = getPath(file.path);
        });
      }
      if (req.file) {
        req.body[req.file.fieldname] = getPath(req.file.path);
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

const dynamicUpload = async (req, res, next) => {
  const { Model, collection } = req;
  // get options from collection
  // size limit, file types
  const options = {};
  const fields = collection.fields
    .filter((field) => field.inputType === "file")
    .map((field) => ({ name: field.name, multiple: field.multiple }));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `${uploadDir}/dynamicTables/${collection.name}_${collection.user}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `${ObjectId()}${ext}`;

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

  upload = upload.fields(fields);

  return upload(req, res, async (err) => {
    if (req.files) {
      Object.entries(req.files).forEach(([fieldname, files]) => {
        const field = fields.find((f) => f.name === fieldname);
        if (field.multiple) {
          req.body[fieldname] = [
            ...(typeof req.body[fieldname] === "string"
              ? [req.body[fieldname]]
              : req.body[fieldname] || []),
            ...files.map((file) => getPath(file.path)),
          ];
        } else {
          req.body[fieldname] = getPath(files[0].path);
        }
      });
    }

    const record = req.params.id
      ? await Model.findOne({ _id: ObjectId(req.params.id) })
      : null;
    if (record) {
      collection.fields.forEach((field) => {
        if (field.inputType === "file" && record[field.name]?.length > 0) {
          if (field.multiple) {
            record[field.name].forEach((fileLink) => {
              if (!req.body[field.name]?.includes(fileLink)) {
                fs.unlink(
                  uploadDir + fileLink.replace(appConfig.uploadDir, ""),
                  (err) => {
                    // store reminder to remove this file later
                  }
                );
              }
            });
          } else {
            if (req.body[field.name] !== record[field.name]) {
              fs.unlink(
                uploadDir + record[field.name].replace(appConfig.uploadDir, ""),
                (err) => {
                  // store reminder to remove this file later
                }
              );
            }
          }
        }
      });
    }

    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return responseFn.error(
          res,
          {},
          responseStr.file_too_large.replace(
            "{maxSize}",
            `${options.fileSize || 10}MB`
          ),
          400
        );
      }
      return responseFn.error(res, {}, err?.message);
    }
    next();
  });
};

const removeFiles = async (req, res, next) => {
  const { Model, collection } = req;

  const fileFields = collection.fields
    .filter((field) => field.inputType === "file")
    .map((item) => item.name);
  const records = await Model.find(
    { _id: { $in: [...(req.body.ids || []), req.params.id] } },
    fileFields.join(" ")
  );
  const links = [];
  records.forEach((record) => {
    fileFields.forEach((field) => {
      if (record[field]?.length > 0)
        if (typeof record[field] === "string") {
          links.push(
            uploadDir + record[field].replace(appConfig.uploadDir, "")
          );
        } else {
          links.push(
            ...record[field].map(
              (link) => uploadDir + link.replace(appConfig.uploadDir, "")
            )
          );
        }
    });
  });

  links.forEach((link) => {
    fs.unlink(link, () => {
      // store reminder to remove the files later
    });
  });

  next();
};

module.exports = { upload, dynamicUpload, removeFiles };
