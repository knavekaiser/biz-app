const {
  authConfig,
  appConfig,
  appConfig: { responseFn, responseStr },
} = require("../config");
const Collection = require("../models/collection.model");

const getType = (type) => {
  let t;
  switch (type) {
    case "string":
    case "text":
      t = String;
      break;
    case "number":
      t = Number;
      break;
    case "date":
      t = Date;
      break;
    case "boolean":
      t = Boolean;
      break;
    case "array":
      t = Array;
      break;
    case "objectId":
      t = Schema.Types.ObjectId;
      break;
    default:
  }
  return t;
};

exports.getModel = async (table) => {
  if (mongoose.models[table]) {
    return mongoose.models[table];
  }
  const [_id, name] = table.split("_");
  const collection = await Collection.findOne({ name, user: _id });
  const fields = {};
  collection.fields.forEach((field) => {
    fields[field.name] = {
      type: getType(field.dataType),
      ...(field.dataType === "objectId" && { ref: field.collection }),
      required: field.required,
    };
  });

  return mongoose.model(
    table,
    new Schema(fields, { timestamps: true, strict: false })
  );
};
