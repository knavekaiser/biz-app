const {
  appConfig: { responseFn, responseStr },
} = require("../config");

const { Staff } = require("../models");

exports.findAll = async (req, res) => {
  try {
    Staff.find(
      {
        businesses: {
          $elemMatch: { business: req.business?._id || req.authUser._id },
        },
      },
      "name phone businesses"
    )
      .populate("businesses.roles", "name permissions")
      .then((data) =>
        responseFn.success(res, {
          data: data.map((item) => ({
            ...item._doc,
            businesses: undefined,
            roles:
              item.businesses.find(
                (item) =>
                  item.business.toString() ===
                  (req.business?._id || req.authUser._id).toString()
              )?.roles || [],
          })),
        })
      )
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

exports.update = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.body.employee });

    await Staff.updateOne(
      { _id: req.body.employee },
      {
        businesses: [
          ...staff.businesses.filter(
            (item) =>
              item.business?.toString() !==
              (req.business?._id || req.authUser._id).toString()
          ),
          ...(req.body.roles?.length
            ? [
                {
                  business: req.business?._id || req.authUser._id,
                  roles: req.body.roles,
                },
              ]
            : []),
        ],
      },
      { new: true }
    );

    const newStaff = req.body.roles?.length
      ? await Staff.findOne({ _id: req.body.employee }).populate(
          "businesses.roles",
          "name permissions"
        )
      : null;

    return responseFn.success(res, {
      data: newStaff
        ? {
            ...newStaff._doc,
            businesses: undefined,
            roles:
              newStaff.businesses.find(
                (item) =>
                  item.business.toString() ===
                  (req.business?._id || req.authUser._id).toString()
              )?.roles || [],
          }
        : null,
    });
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
