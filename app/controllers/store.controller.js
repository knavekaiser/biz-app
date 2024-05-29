import fetch from "node-fetch";
import { appConfig } from "../config/index.js";
import { fileHelper, dbHelper } from "../helpers/index.js";
import { Store, StoreConfig, AdSchema, User } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const homeStores = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      address_city,
      address_county,
      address_state,
      address_country,
      ...query
    } = req.query;
    const conditions = {
      $expr: {
        $and: [
          { $lte: ["$start", new Date()] },
          { $gte: ["$end", new Date()] },
        ],
      },
    };
    if (category) {
      conditions.category = { $in: category.split(",") };
    }
    if (subcategory) {
      conditions.subcategory = { $in: subcategory.split(",") };
    }
    const address = JSON.parse(
      JSON.stringify({
        "business.address.city": address_city,
        "business.address.county": address_county,
        "business.address.state": address_state,
        "business.address.country": address_country,
      })
    );
    const productQuery = [];
    const schema = await AdSchema.findOne({ category, name: subcategory });
    schema?.fields.forEach((field) => {
      if (field.name in query) {
        if (field.dataType === "string" || field.dataElementType === "string") {
          productQuery.push({
            $regexMatch: {
              input:
                field.dataElementType === "string"
                  ? {
                      $reduce: {
                        input: `$$product.${field.name}`,
                        initialValue: "",
                        in: { $concat: ["$$value", "$$this"] },
                      },
                    }
                  : `$$product.${field.name}`,
              regex: RegExp(query[field.name].split(",").join("|")),
              options: "i",
            },
          });
        } else if (field.dataElementType === "number") {
          query.push({
            $in: [
              query[field.name]
                .split(",")
                .map((i) => +i)
                .map((i) => isNaN(i)),
              `$$product.${field.name}`,
            ],
          });
        } else if (field.dataType === "number") {
          productQuery.push({
            $eq: [`$$product.${field.name}`, +query[field.name]],
          });
        }
      } else if (
        +req.query[field.name + "-min"] <= +req.query[field.name + "-max"]
      ) {
        productQuery.push({
          $and: [
            { $gte: [`$$product.${field.name}`, +query[`${field.name}-min`]] },
            { $lte: [`$$product.${field.name}`, +query[`${field.name}-max`]] },
          ],
        });
      }
    });
    // console.log(query, JSON.stringify(productQuery, null, 2));
    Store.aggregate([
      { $match: conditions },
      {
        $lookup: {
          from: "users",
          as: "business",
          let: { id: "$business" },
          pipeline: [
            { $match: { $expr: { $eq: ["$$id", "$_id"] } } },
            {
              $project: {
                phone: 1,
                email: 1,
                name: 1,
                photo: 1,
                logo: 1,
                domain: 1,
                address: 1,
              },
            },
            {
              $lookup: {
                from: "configs",
                localField: "_id",
                foreignField: "user",
                as: "siteConfig",
              },
            },
            {
              $unwind: {
                path: "$siteConfig",
                preserveNullAndEmptyArrays: false,
              },
            },
            { $set: { siteConfig: "$siteConfig.siteConfig" } },
          ],
        },
      },
      { $unwind: { path: "$business", preserveNullAndEmptyArrays: false } },
      ...(productQuery.length
        ? [
            {
              $addFields: {
                products: {
                  $filter: {
                    input: "$products",
                    as: "product",
                    cond: { $and: productQuery },
                  },
                },
              },
            },
          ]
        : []),
      {
        $match: {
          $expr: { $gt: [{ $size: "$products" }, 0] },
          ...address,
        },
      },
    ])
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const homeStoreCategories = async (req, res) => {
  try {
    const { Model } = await dbHelper.getAdminModel("Store Category");
    if (!Model) {
      return responseFn.error(
        res,
        {},
        responseStr.record_not_found.replace("Record", "Category Table")
      );
    }
    Model.aggregate([
      {
        $lookup: {
          from: "Admin_Store Subcategory",
          localField: "_id",
          foreignField: "category",
          as: "subcategories",
        },
      },
      {
        $project: {
          name: 1,
          "subcategories.name": 1,
          "subcategories.fields": 1,
        },
      },
    ])
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const homeConfig = async (req, res) => {
  try {
    StoreConfig.findOne()
      .then(async (data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const find = async (req, res) => {
  try {
    const conditions = {};
    if ("name" in req.query) {
      conditions.name = {
        $regex: req.query.name,
        $options: "i",
      };
    }
    if ("business" in req.query) {
      conditions.business = req.query.business;
    }
    if ("featured" in req.query) {
      conditions.featured = req.query.featured === "true";
    }
    Store.find(conditions, "-__v")
      .populate("business", "name phone email domain logo")
      .populate("createdBy", "name phone email")
      .then((data) => {
        responseFn.success(res, { data });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const create = async (req, res) => {
  try {
    new Store({ ...req.body, createdBy: req.authUser._id })
      .save()
      .then(async (data) => {
        const store = await Store.findOne({ _id: data._id })
          .populate("business", "name phone email domain logo")
          .populate("createdBy", "name phone email");
        return responseFn.success(res, { data: store });
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    if (req.body.image) {
      fileHelper.deleteFiles(req.body.image);
    }
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    Store.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
      .then(async (data) => {
        const store = await Store.findOne({ _id: data._id })
          .populate("business", "name phone email domain logo")
          .populate("createdBy", "name phone email");
        return responseFn.success(
          res,
          { data: store },
          responseStr.record_updated
        );
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const deleteStore = async (req, res) => {
  try {
    if (!req.params.id && !req.body.ids?.length) {
      return responseFn.error(res, {}, responseStr.select_atleast_one_record);
    }
    const stores = await Store.find(
      {
        _id: { $in: [...(req.body.ids || []), req.params.id] },
      },
      "photo"
    );
    stores.forEach(async (store) => {
      if (store.photo) {
        fileHelper.deleteFiles(store.photo);
      }
    });
    Store.deleteMany({
      _id: { $in: [...(req.body.ids || []), req.params.id] },
    })
      .then((num) => responseFn.success(res, {}, responseStr.record_deleted))
      .catch((err) => responseFn.error(res, {}, err.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const storeConfig = async (req, res) => {
  try {
    StoreConfig.findOne().then((data) => responseFn.success(res, { data }));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const updateStoreConfig = async (req, res) => {
  try {
    StoreConfig.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    }).then((data) => responseFn.success(res, { data }));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const locations = async (req, res) => {
  try {
    let userAddress = null;
    if (req.query.latlng) {
      await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.query.latlng}&key=${process.env.GOOGLE_MAP_API_KEY}`
      )
        .then((data) => data.json())
        .then((data) => {
          let components = data.results?.[0]?.address_components;
          if (components?.length) {
            let parts = components.filter(
              (item) =>
                !(
                  item.types.includes("plus_code") ||
                  item.types.includes("route") ||
                  (item.types.includes("locality") &&
                    item.types.includes("political"))
                )
            );
            const countryIndex = parts.findIndex((item) =>
              item.types.includes("country")
            );
            if (countryIndex === parts.length - 1) {
            } else {
              parts = parts.slice(0, -(parts.length - countryIndex));
            }
            if (parts.length > 4) {
              parts.slice(-4);
            }
            if (parts.length < 4) {
              parts.unshift(
                components.filter(
                  (item) =>
                    !(
                      item.types.includes("plus_code") ||
                      item.types.includes("route")
                    )
                )[0]
              );
            }
            if (parts.length === 4) {
              const [
                { long_name: city },
                { long_name: county },
                { long_name: state },
                { long_name: country },
              ] = parts;
              userAddress = { city, county, state, country };
            }
          }
        })
        .catch((err) => console.log(err));
    }
    if (userAddress) {
      // console.log(userAddress);
    }
    User.aggregate([
      {
        $facet: {
          states: [
            {
              $project: {
                city: "$address.city",
                county: "$address.county",
                state: "$address.state",
                country: "$address.country",
              },
            },
            {
              $group: {
                _id: { state: "$city", country: "$state" },
                count: { $sum: 1 },
                cities: { $push: "$$ROOT" },
              },
            },
            { $match: { count: { $gte: 1 } } },
            { $replaceRoot: { newRoot: { $arrayElemAt: ["$cities", 0] } } },
            {
              $group: {
                _id: "$state",
                cities: {
                  $push: {
                    label: "$city",
                    county: "$county",
                    state: "$state",
                    type: "city",
                  },
                },
              },
            },
            { $set: { type: "state", label: "$_id" } },
            { $unset: "_id" },
          ],
          countries: [
            {
              $project: {
                state: "$address.state",
                country: "$address.country",
              },
            },
            {
              $group: {
                _id: { state: "$state", country: "$country" },
                count: { $sum: 1 },
                states: { $push: "$$ROOT" },
              },
            },
            { $match: { count: { $gte: 1 } } },
            { $replaceRoot: { newRoot: { $arrayElemAt: ["$states", 0] } } },
            {
              $group: {
                _id: "$country",
                states: {
                  $push: {
                    label: "$state",
                    country: "$country",
                    type: "state",
                  },
                },
              },
            },
            { $set: { type: "country", label: "$_id" } },
            { $unset: "_id" },
          ],
        },
      },
      {
        $project: {
          result: { $concatArrays: ["$states.cities", "$countries.states"] },
        },
      },
      { $unwind: "$result" },
      { $unwind: "$result" },
      { $replaceRoot: { newRoot: "$result" } },
      { $sort: { state: 1, label: 1, country: 1 } },
    ]).then((data) => {
      return responseFn.success(res, {
        data,
        ...(req.query.latlng && {
          match:
            data
              .filter((item) => item.type === "city")
              .find((item) => item.label === userAddress?.city) ||
            data
              .filter((item) => item.type === "city")
              .find((item) => item.county === userAddress?.county) ||
            data
              .filter((item) => item.type === "state")
              .find((item) => item.label === userAddress?.state),
        }),
      });
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
