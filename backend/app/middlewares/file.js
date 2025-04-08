import multer from "multer";
import { appConfig } from "../config/index.js";
import { ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cdnHelper } from "../helpers/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { responseFn, responseStr } = appConfig;

const uploadDir = __dirname.replace(/(\\|\/)app.*/, "") + appConfig.uploadDir;
const getPath = (str) =>
  str
    .replace(/\\/g, "/")
    .replace(new RegExp(`.*(?=${appConfig.uploadDir})`, "gi"), "");

export const upload = (fields, options) => {
  try {
    let upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: (appConfig.supportedFileSizes || 10) * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const field = fields.find((field) => field.name === file.fieldname);
        if (
          (field.mimetype || appConfig.supportedFileTypes).test(file.mimetype)
        ) {
          cb(null, true);
        } else {
          cb(
            responseStr.unsupported_file_type.replace(
              "{fileTypes}",
              `${appConfig.supportedFileTypes}`
                .replace(/\/|\//g, "")
                .split("|")
                .join(", ")
            ),
            false
          );
        }
      },
      filename: (req, file, cb) => {
        const field = fields.find((field) => field.name === file.name);
        const ext = path.extname(file.name);
        cb(
          null,
          `${options?.pathname || field.pathname || ""}${new ObjectId()}${ext}`
        );
      },
    });

    upload = upload.fields(
      fields.map((f) => ({ name: f.name, maxCount: f.maxCount || 1 }))
    );

    return (req, res, next) => {
      if (!fields.length) return next();
      return upload(req, res, async (err) => {
        if (err) {
          return responseFn.error(res, {}, err, 400);
        }

        let response = [];

        const rawFiles = [];
        const files = await Promise.all(
          fields
            .map((field) => {
              if (field.raw) {
                rawFiles.push({
                  field: field.name,
                  ...(field.multiple
                    ? { files: req.files[field.name] }
                    : { file: req.files[field.name][0] }),
                });
                return;
              }
              if (field.name in req.body) {
                const value = req.body[field.name];
                if (!value || value === "null") {
                  req.body[field.name] = field.multiple ? [] : null;
                } else if (typeof value === "string") {
                  req.files[field.name] = JSON.parse(value);
                  if (!Array.isArray(req.files[field.name])) {
                    req.files[field.name] = [req.files[field.name]];
                  }
                  delete req.body[field.name];
                }
              }

              if (!(field.name in (req.files || {}))) return null;
              const files = (req.files[field.name] || []).filter(
                (file) => file && file.buffer
              );
              const existingFiles = (req.files[field.name] || []).filter(
                (file) => file && file.url
              );

              if (existingFiles.length) {
                if (field.multiple) {
                  req.body[field.name] = existingFiles.map((file) =>
                    (options?.store || field.store) === "keyOnly"
                      ? file.url
                      : file
                  );
                } else if (req.files[field.name]) {
                  req.body[field.name] =
                    (options?.store || field.store) === "keyOnly"
                      ? existingFiles[0].url
                      : existingFiles[0];
                } else {
                  req.body[field.name] = null;
                }
              } else {
                if (field.multiple) {
                  req.body[field.name] = [];
                } else {
                  req.body[field.name] = null;
                }
              }
              if (!files?.length) return null;

              return files.map(async (file) => {
                const ext = path.extname(file.originalname);
                return {
                  metadata: {
                    field: field.name,
                    size: file.size,
                    originalName: file.originalname,
                    mime: file.mimetype || file.type,
                  },
                  key: `${
                    options?.pathname || field.pathname || ""
                  }${new ObjectId()}${ext}`,
                  buffer: file.buffer,
                };
              });
            })
            .filter((x) => x)
            .flat()
        ).catch((err) => {
          throw err;
        });

        response = await cdnHelper.uploadFiles(files);
        req.files = [...response, ...rawFiles];

        response.forEach((file, i) => {
          const field = fields.find((item) => item.name === file.field);
          const final =
            (options?.store || field.store) === "keyOnly"
              ? file.key
              : {
                  url: file.key,
                  mime: file.mime,
                  size: file.size,
                  name: file.originalName,
                  ...(file.dimensions && { dimensions: file.dimensions }),
                };

          if (!field.multiple) {
            req.body[field.name] = final;
            return;
          }

          if (req.body[field.name]) {
            if (Array.isArray(req.body[field.name])) {
              req.body[field.name] = [...req.body[field.name], final];
            } else {
              req.body[field.name] = [req.body[field.name], final];
            }
          } else {
            req.body[field.name] = final;
          }
        });

        return next();
      });
    };
  } catch (err) {
    console.log(err);
  }
};

export const dynamicUpload = async (req, res, next) => {
  const { Model, collection } = req;
  const companyId =
    req.authToken.userType === "admin"
      ? req.query.business || req.business._id
      : (req.business || req.authUser)?._id;
  // get options from collection
  // size limit, file types
  const options = {};
  const fields = collection.fields
    .filter((f) => f.fieldType === "input" && f.inputType === "file")
    .map((f) => ({
      name: f.name,
      multiple: f.multiple,
      store:
        f[f.multiple ? "dataElementType" : "dataType"] === "string"
          ? "keyOnly"
          : "full",
    }));

  let upload = multer({
    storage: multer.memoryStorage(),
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
    filename: (req, file, cb) => {
      const ext = path.extname(file.name);
      cb(
        null,
        `${companyId}/dynamic/${collection.name}/${new ObjectId()}${ext}`
      );
    },
  });

  upload = upload.fields(fields);

  return upload(req, res, async (err) => {
    let response = [];
    const files = await Promise.all(
      fields
        .map((field) => {
          if (field.name in req.body) {
            const value = req.body[field.name];
            if (!value || value === "null") {
              req.body[field.name] = field.multiple ? [] : null;
            } else if (typeof value === "string" || Array.isArray(value)) {
              const existingFile = Array.isArray(value)
                ? value.map((file) => JSON.parse(file))
                : JSON.parse(value);
              req.files[field.name] = Array.isArray(existingFile)
                ? [...(req.files[field.name] || []), ...existingFile]
                : [...(req.files[field.name] || []), existingFile];
              delete req.body[field.name];
            }
          }

          if (!(field.name in (req.files || {}))) return null;
          const files = (req.files[field.name] || []).filter(
            (file) => file && file.buffer
          );
          const existingFiles = (req.files[field.name] || []).filter(
            (file) => file && file.url
          );

          if (existingFiles.length) {
            if (field.multiple) {
              req.body[field.name] = existingFiles.map((file) =>
                field.store === "keyOnly" ? file.url : file
              );
            } else if (req.files[field.name]) {
              req.body[field.name] =
                field.store === "keyOnly"
                  ? existingFiles[0].url
                  : existingFiles[0];
            } else {
              req.body[field.name] = null;
            }
          } else {
            if (field.multiple) {
              req.body[field.name] = [];
            } else {
              req.body[field.name] = null;
            }
          }
          if (!files?.length) return null;

          return files.map(async (file) => {
            const ext = path.extname(file.originalname);
            return {
              metadata: {
                field: field.name,
                size: file.size,
                originalName: file.originalname,
                mime: file.mimetype || file.type,
              },
              key: `${companyId}/dynamic/${
                collection.name
              }/${new ObjectId()}${ext}`,
              buffer: file.buffer,
            };
          });
        })
        .filter((x) => x)
        .flat()
    ).catch((err) => {
      throw err;
    });

    response = await cdnHelper.uploadFiles(files);
    req.files = [...response];

    response.forEach((file, i) => {
      const field = fields.find((item) => item.name === file.field);
      const final =
        field.store === "keyOnly"
          ? file.key
          : {
              url: file.key,
              mime: file.mime,
              size: file.size,
              name: file.originalName,
              ...(file.dimensions && { dimensions: file.dimensions }),
            };

      if (!field.multiple) {
        req.body[field.name] = final;
        return;
      }

      if (req.body[field.name]) {
        if (Array.isArray(req.body[field.name])) {
          req.body[field.name] = [...req.body[field.name], final];
        } else {
          req.body[field.name] = [req.body[field.name], final];
        }
      } else {
        req.body[field.name] = final;
      }
    });

    const record = req.params.id
      ? await Model.findOne({ _id: ObjectId(req.params.id) })
      : null;
    if (record) {
      fields.forEach(async (field) => {
        if (record[field.name]?.length > 0) {
          if (field.multiple) {
            const oldFiles = record[field.name].map((file) => file.url || file);
            const newFiles = req.body[field.name].map(
              (file) => file.url || file
            );
            const filesToDelete = oldFiles.filter(
              (file) => !newFiles.includes(file)
            );
            await cdnHelper.deleteFiles(filesToDelete);
          } else {
            const oldFile = record[field.name]?.url || record[field.name];
            const newFile = req.body[field.name]?.url || req.body[field.name];

            if (oldFile && oldFile !== newFile) {
              await cdnHelper.deleteFiles(oldFile);
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

export const removeFiles = async (req, res, next) => {
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
