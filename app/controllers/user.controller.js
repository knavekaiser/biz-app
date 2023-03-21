const {
  authConfig,
  appConfig,
  appConfig: { responseFn, responseStr },
} = require("../config");
const {
  appHelper,
  smsHelper,
  appHelper: { genId },
} = require("../helpers");

const { User, Otp, Config, Collection } = require("../models");

const defaultSchemas = [
  {
    name: "Product",
    fields: [
      {
        name: "title",
        required: true,
        label: "Title",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        name: "description",
        inputType: "text",
        dataType: "string",
        fieldType: "textarea",
        label: "Description",
        required: true,
      },
      {
        name: "images",
        required: true,
        label: "Images",
        dataType: "array",
        fieldType: "input",
        inputType: "file",
        dataElementType: "string",
        multiple: true,
      },
      {
        name: "price",
        inputType: "number",
        dataType: "number",
        fieldType: "input",
        label: "Price",
        required: true,
        decimalPlaces: "0.00",
      },
      {
        name: "whatsappNumber",
        required: true,
        label: "WhatsApp",
        dataType: "string",
        fieldType: "input",
        inputType: "phone",
      },
    ],
  },
  {
    name: "Campaign",
    fields: [
      {
        dataType: "string",
        fieldType: "input",
        inputType: "text",
        name: "title",
        label: "Title",
        required: true,
      },
      {
        name: "description",
        label: "Description",
        required: true,
        dataType: "string",
        fieldType: "textarea",
        inputType: "text",
      },
      {
        name: "startDate",
        label: "Start Date",
        required: true,
        dataType: "date",
        fieldType: "input",
        inputType: "date",
      },
      {
        name: "endDate",
        label: "End Date",
        required: true,
        dataType: "date",
        fieldType: "input",
        inputType: "date",
      },
      {
        name: "status",
        label: "Status",
        required: true,
        dataType: "string",
        fieldType: "combobox",
        inputType: "",
        optionType: "array",
        options: [
          {
            label: "Inactive",
            value: "inactive",
            _id: "ushaw7fp",
          },
          {
            label: "Active",
            value: "active",
            _id: "4uk2shs5",
          },
        ],
      },
      {
        name: "amountTable",
        required: false,
        label: "Amount Table",
        dataType: "array",
        fieldType: "input",
        dataElementType: "object",
        fields: [
          {
            name: "startDate",
            required: true,
            label: "Start Date",
            dataType: "date",
            fieldType: "input",
            inputType: "date",
            _id: "56797722",
          },
          {
            name: "endDate",
            required: true,
            label: "End Date",
            dataType: "date",
            fieldType: "input",
            inputType: "date",
            _id: "17165027",
          },
          {
            name: "amount",
            required: true,
            label: "Amount",
            dataType: "number",
            fieldType: "input",
            inputType: "number",
            _id: "81099445",
          },
          {
            name: "amountType",
            required: true,
            label: "Amount Type",
            dataType: "string",
            fieldType: "combobox",
            optionType: "array",
            options: [
              {
                label: "Flat",
                value: "flat",
                _id: "bd76kiee",
              },
              {
                label: "Percent",
                value: "percent",
                _id: "dvmblh8a",
              },
            ],
          },
        ],
      },
      {
        name: "includeProducts",
        required: false,
        label: "Include Products",
        dataType: "object",
        fieldType: "collectionFilter",
      },
      {
        name: "excludeProducts",
        required: false,
        label: "Exclude Products",
        dataType: "object",
        fieldType: "collectionFilter",
      },
    ],
  },
  {
    name: "Customer",
    fields: [
      {
        unique: false,
        name: "name",
        required: true,
        label: "Name",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: true,
        name: "email",
        required: false,
        label: "Email",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: true,
        name: "phone",
        required: false,
        label: "phone",
        dataType: "string",
        fieldType: "input",
        inputType: "text",
      },
      {
        unique: false,
        name: "password",
        required: true,
        label: "password",
        dataType: "string",
        fieldType: "input",
        inputType: "password",
      },
    ],
  },
  {
    name: "Review",
    fields: [
      {
        unique: false,
        name: "product",
        required: false,
        label: "Product",
        dataType: "objectId",
        collection: "Product",
        foreignField: "_id",
      },
      {
        name: "rating",
        inputType: "",
        dataType: "number",
        fieldType: "none",
        label: "Rating",
        required: false,
      },
      {
        name: "review",
        inputType: "",
        dataType: "string",
        fieldType: "textarea",
        label: "Review",
        required: false,
      },
      {
        name: "customer",
        dataType: "objectId",
        collection: "Customer",
        fieldType: "none",
        label: "Customer",
        required: false,
        foreignField: "_id",
      },
    ],
  },
  {
    name: "Order",
    fields: [
      {
        unique: false,
        name: "products",
        required: false,
        label: "Products",
        dataType: "array",
        dataElementType: "object",
        fields: [
          {
            unique: true,
            name: "product",
            required: false,
            label: "Product",
            dataType: "object",
            fieldType: "select",
            inputType: "text",
            multiple: false,
            optionType: "collection",
            collection: "Product",
            optionLabel: "title",
            optionValue: "_id",
          },
          {
            unique: false,
            name: "qty",
            required: false,
            label: "Qty",
            dataType: "number",
            fieldType: "combobox",
            multiple: false,
            optionType: "array",
            options: [
              {
                label: "15",
                value: 15,
                _id: "amjsnfnz",
              },
              {
                label: "14",
                value: 14,
                _id: "jlo8iohd",
              },
              {
                label: "13",
                value: 13,
                _id: "vpfd5x2c",
              },
              {
                label: "12",
                value: 12,
                _id: "umdqdjj8",
              },
              {
                label: "11",
                value: 11,
                _id: "n5ftw6gg",
              },
              {
                label: "10",
                value: 10,
                _id: "5xazsmxr",
              },
              {
                label: "9",
                value: 9,
                _id: "ziqz26i4",
              },
              {
                label: "8",
                value: 8,
                _id: "xgui4t7l",
              },
              {
                label: "7",
                value: 7,
                _id: "0eb1wua6",
              },
              {
                label: "6",
                value: 6,
                _id: "oigkuv5m",
              },
              {
                label: "5",
                value: 5,
                _id: "z4kswzhc",
              },
              {
                label: "4",
                value: 4,
                _id: "w0riq1zh",
              },
              {
                label: "3",
                value: 3,
                _id: "1xsanxkc",
              },
              {
                label: "2",
                value: 2,
                _id: "z6mtpxj7",
              },
              {
                label: "1",
                value: 1,
                _id: "b2c26pzw",
              },
            ],
          },
          {
            unique: false,
            name: "color",
            required: false,
            label: "Color",
            dataType: "string",
            fieldType: "select",
            inputType: "text",
            multiple: false,
            optionType: "collection",
            collection: "Product color",
            optionLabel: "name",
            optionValue: "name",
          },
          {
            unique: false,
            name: "size",
            required: false,
            label: "Size",
            dataType: "string",
            fieldType: "combobox",
            multiple: false,
            optionType: "array",
            options: [
              {
                label: "Large",
                value: "L",
                _id: "h3kvzmhh",
              },
              {
                label: "Small",
                value: "S",
                _id: "sm8jo05s",
              },
              {
                label: "Medium",
                value: "M",
                _id: "ghxo5kn7",
              },
            ],
          },
          {
            unique: false,
            name: "variant",
            required: false,
            label: "Variant",
            dataType: "object",
            fieldType: "none",
            multiple: false,
          },
        ],
      },
      {
        name: "customer",
        inputType: "text",
        dataType: "objectId",
        dataElementType: "",
        dataElements: "",
        collection: "Customer",
        fieldType: "select",
        optionType: "collection",
        multiRange: "",
        label: "Customer",
        required: true,
        decimalPlaces: "",
        unique: "",
        multiple: false,
        optionLabel: "name",
        optionValue: "_id",
        foreignField: "_id",
      },
      {
        unique: false,
        name: "price",
        required: false,
        label: "Price",
        dataType: "number",
        fieldType: "none",
      },
      {
        name: "status",
        inputType: "",
        dataType: "string",
        dataElementType: "",
        dataElements: "",
        collection: "",
        fieldType: "combobox",
        optionType: "array",
        options: [
          {
            label: "Ordered - COD",
            value: "orderedCod",
            _id: "mjdbllxr",
          },
          {
            label: "Complete",
            value: "complete",
            _id: "8d5zic0h",
          },
          {
            label: "Shipped",
            value: "shipped",
            _id: "cx54dmpq",
          },
          {
            label: "Ordered - Paid",
            value: "orderedPaid",
            _id: "zuy69ppv",
          },
          {
            label: "Cart",
            value: "cart",
            _id: "uqu5gc7z",
          },
        ],
        multiRange: "",
        label: "Status",
        required: false,
        decimalPlaces: "",
        unique: "",
        multiple: false,
      },
    ],
  },
];

exports.signup = async (req, res) => {
  try {
    req.body.password = appHelper.generateHash(req.body.password);

    new User({ ...req.body })
      .save()
      .then(async (user) => {
        await new Config({ user: user._id }).save();
        await Collection.insertMany(
          defaultSchemas.map((item) => ({ ...item, user: user._id }))
        );
        return appHelper.signIn(res, user._doc, "business");
      })
      .catch((err) => {
        return responseFn.error(res, {}, err.message);
      });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (user && appHelper.compareHash(req.body.password, user.password)) {
      return appHelper.signIn(res, user._doc, "business");
    } else {
      return responseFn.error(res, {}, responseStr.invalid_cred);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });

    if (user) {
      const otp = genId(6, { numbers: true });
      new Otp({
        user: user._id,
        code: appHelper.generateHash(otp),
      })
        .save()
        .then(async (otpRec) => {
          // smsHelper.send()
          const result = { success: true };
          if (result.success) {
            return responseFn.success(
              res,
              {
                data: {
                  phone: user.phone,
                  timeout: appConfig.otpTimeout,
                },
              },
              responseStr.otp_sent + ` (use ${otp})`
            );
          } else {
            await Otp.deleteOne({ _id: otpRec._id });
            return responseFn.error(res, {}, responseStr.otp_sms_failed);
          }
        })
        .catch(async (err) => {
          if (err.code === 11000) {
            const otpRec = await Otp.findOne({ user: user._id });

            return responseFn.error(
              res,
              {
                cooldown: parseInt(
                  appConfig.otpTimeout -
                    (new Date() - new Date(otpRec.createdAt)) / 1000
                ),
              },
              responseStr.otp_sent_already
            );
          }
          return responseFn.error(res, {}, error.message, 500);
        });
    } else {
      return responseFn.error(res, {}, responseStr.record_not_found);
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.body.phone });
    const otpRec = await Otp.findOne({ user: user._id });
    if (!otpRec) {
      return responseFn.error(res, {}, responseStr.otp_not_found);
    }
    if (appHelper.compareHash(req.body.code, otpRec.code)) {
      await User.updateOne(
        { _id: user._id },
        { password: appHelper.generateHash(req.body.password) }
      );
      await Otp.deleteOne({ _id: otpRec._id });
      return responseFn.success(res, {}, responseStr.password_reset_successful);
    } else {
      if (otpRec.attempts >= appConfig.passwordResetOtpAttepts - 1) {
        await Otp.deleteOne({ _id: otpRec._id });
        return responseFn.error(
          res,
          {},
          responseStr.too_many_attempts_to_reset_password
        );
      } else {
        await Otp.updateOne({ _id: otpRec._id }, { $inc: { attempts: 1 } });
        return responseFn.error(
          res,
          {
            attemptsLeft:
              appConfig.passwordResetOtpAttepts - (otpRec.attempts + 1),
          },
          responseStr.wrong_otp.replace(
            "{NUM}",
            appConfig.passwordResetOtpAttepts - (otpRec.attempts + 1)
          )
        );
      }
    }
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("access_token");
    return responseFn.success(res, {});
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.profile = (req, res) => {
  try {
    User.findOne({ _id: req.authUser.id }, "-password -__v -updatedAt")
      .then(async (data) =>
        responseFn.success(res, {
          data: { ...data._doc, userType: "business" },
        })
      )
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = appHelper.generateHash(req.body.password);
    }
    if (req.body.ownerSignature) {
      req.body.ownerDetails = {
        ...req.body.ownerDetails,
        signature: req.body.ownerSignature,
      };
    }
    User.findOneAndUpdate({ _id: req.authUser._id }, req.body, { new: true })
      .then((data) =>
        responseFn.success(
          res,
          {
            data: {
              ...data._doc,
              password: undefined,
              __v: undefined,
              updatedAt: undefined,
            },
          },
          responseStr.record_updated
        )
      )
      .catch((error) => responseFn.error(res, {}, error.message, 500));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
