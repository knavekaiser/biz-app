import mongoose from "mongoose";
import { appConfig } from "../config/index.js";
import { Company, getModel } from "../models/index.js";
import { ObjectId } from "mongodb";

const { responseFn, responseStr } = appConfig;

export const getAll = async (req, res) => {
  try {
    const Module = getModel({
      companyId: (req.business || req.authUser)._id,
      name: "Module",
    });
    const Submodule = getModel({
      companyId: (req.business || req.authUser)._id,
      name: "Submodule",
    });

    const conditions = { user: req.business?._id || req.authUser._id };
    if (req.authToken.userType === "admin") {
      conditions.user = req.query.business || req.business._id;
    }

    const modules = await Module.find(conditions);
    const submodules = await Submodule.find(conditions).populate(
      "module",
      "_id name"
    );

    responseFn.success(res, {
      data: [
        ...modules
          .map((mod) => [
            {
              label: `Module: ${mod.name}`,
              name: mod.name,
              type: "module",
              fields: [
                { name: "_id", label: "ID", unique: true, fieldType: null },
                {
                  name: "createdAt",
                  label: "Created At",
                  dataType: "date",
                  fieldType: null,
                },
                {
                  name: "updatedAt",
                  label: "Updated At",
                  dataType: "date",
                  fieldType: null,
                },
                ...mod.fields,
                // .filter((field) => !field.coll),
              ],
            },
            // ...mod.fields
            //   .filter((field) => field.coll)
            //   .map((field) => ({
            //     label: `Module: ${mod.name} - ${field.name}`,
            //     name: field.name,
            //     module: mod.name,
            //     fields: [
            //       { name: "_id", label: "ID", unique: true, fieldType: null },
            //       ...(field.coll.fields || []),
            //     ],
            //     type: "module-coll",
            //   })),
          ])
          .flat(),
        ...submodules
          .map((mod) => [
            {
              label: `Submodule: ${mod.module.name} - ${mod.name}`,
              name: mod.name,
              type: "submodule",
              module: mod.module?.name,
              fields: [
                { name: "_id", label: "ID", unique: true, fieldType: null },
                {
                  name: "createdAt",
                  label: "Created At",
                  dataType: "date",
                  fieldType: null,
                },
                {
                  name: "updatedAt",
                  label: "Updated At",
                  dataType: "date",
                  fieldType: null,
                },
                ...mod.fields,
                // .filter((field) => !field.coll),
              ],
            },
            // ...mod.fields
            //   .filter((field) => field.coll)
            //   .map((field) => ({
            //     label: `Submodule: ${mod.name} - ${field.name}`,
            //     name: field.name,
            //     module: mod.module?.name,
            //     submodule: mod.name,
            //     fields: [
            //       { name: "_id", label: "ID", unique: true, fieldType: null },
            //       ...(field.coll.fields || []),
            //     ],
            //     type: "submodule-coll",
            //   })),
          ])
          .flat(),
      ],
    });
  } catch (error) {
    console.log(error);
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const findAll = async (req, res) => {
  try {
    const Collection = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Collection",
    });

    const _id =
      req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)
        ? ObjectId(req.params.id)
        : null;
    let tableName =
      req.params.id && !req.params.id.match(/^[0-9a-fA-F]{24}$/)
        ? req.params.id
        : null;
    const conditions = { user: req.business?._id || req.authUser._id };
    if (req.authToken.userType === "admin") {
      conditions.user = req.query.business || req.business._id;
    }
    if (_id) {
      conditions._id = _id;
    }
    if (req.authToken.userType === "staff") {
      const dynamicTables = req.permissions
        .filter(
          (item) =>
            item.startsWith(req.business._id.toString()) &&
            item.endsWith("_read")
        )
        .map((item) =>
          item.replace("_read", "").replace(`${req.business._id}_`, "")
        );
      if (tableName && dynamicTables.includes(tableName)) {
        conditions.name = tableName;
      } else {
        tableName = null;
        conditions.name = { $in: dynamicTables };
      }
    } else {
      if (tableName) {
        conditions.name = tableName;
      }
    }
    Collection.find(conditions)
      .then((data) => {
        if (_id || tableName) {
          if (data.length) {
            responseFn.success(res, { data: data[0] });
          } else {
            responseFn.error(res, {}, responseStr.record_not_found);
          }
          return;
        }
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    const Collection = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Collection",
    });

    new Collection({
      ...req.body,
      user: req.business?._id || req.authUser._id,
    })
      .save()
      .then(async (data) => {
        return responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const Collection = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Collection",
    });

    delete req.body.name;
    Collection.findOneAndUpdate(
      { _id: req.params.id, user: req.business?._id || req.authUser._id },
      req.body,
      { new: true }
    )
      .then((data) => {
        return responseFn.success(res, { data }, responseStr.record_updated);
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteColl = async (req, res) => {
  try {
    const Collection = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Collection",
    });

    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    const collections = await AdminCollection.find({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    });
    Collection.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
      user: req.business?._id || req.authUser._id,
    })
      .then((num) => {
        for (const collection of collections) {
          mongoose.connection.db.dropCollection(
            `${(req.business || req.authUser)._id}_${collection.name}`,
            function (err, result) {}
          );
        }
        responseFn.success(res, {}, responseStr.record_deleted);
      })
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const getSchemaTemplates = async (req, res) => {
  try {
    Company.aggregate([
      {
        $lookup: {
          from: "schemas",
          localField: "_id",
          foreignField: "user",
          as: "schemas",
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$schemas" }, 0] },
          _id: { $ne: req.business?._id || req.authUser._id },
        },
      },
      { $project: { name: 1, _id: 1 } },
    ])
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const addSchemaTemplates = async (req, res) => {
  try {
    const Collection = getModel({
      companyId: (req.business || req.authUser)._id,
      finPeriodId: req.finPeriod._id,
      name: "Collection",
    });

    const schemas = await Collection.find({
      user: ObjectId(req.body.schema_id),
    }).then((data) =>
      data.map((item) => ({
        name: item.name,
        fields: item.fields,
        user: req.business?._id || req.authUser._id,
      }))
    );

    await Collection.deleteMany({
      name: { $in: schemas.map((item) => item.name) },
      user: req.business?._id || req.authUser._id,
    });

    Collection.insertMany(schemas, { ordered: 1 })
      .then((data) => {
        responseFn.success(
          res,
          {},
          responseStr.records_created.replace("{num}", data.length)
        );
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
