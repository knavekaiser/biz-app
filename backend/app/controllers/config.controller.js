import { appConfig } from "../config/index.js";
import { fileHelper } from "../helpers/index.js";
import { Config } from "../models/index.js";

const { responseFn, responseStr } = appConfig;

export const findOne = async (req, res) => {
  try {
    const condition = { user: req.authUser._id };
    if (["admin", "staff"].includes(req.authToken.userType)) {
      condition.user = req.business._id;
    }
    Config.findOne(condition, "-__v")
      .then((data) => responseFn.success(res, { data }))
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const conditions = { user: req.authUser._id };
    if (["admin", "staff"].includes(req.authToken.userType)) {
      conditions.user = req.business._id;
    }
    const config = await Config.findOne(conditions);
    req.files?.dynamicPageFiles?.forEach((file) => {
      const [paths, fileName] = file.originalname.split("___");
      const [siteConfig, footer, section, item, files] = paths.split(".");
      req.body.siteConfig.footer.sections =
        req.body.siteConfig.footer.sections.map((sec) => {
          if (sec.title === section) {
            return {
              ...sec,
              items: sec.items.map((itm) => {
                if (itm.label === item) {
                  return {
                    ...itm,
                    files:
                      itm.type === "dynamicPage"
                        ? [
                            ...(itm.files || []),
                            req.body.dynamicPageFiles.find((path) =>
                              path.includes(file.filename)
                            ),
                          ]
                        : [],
                  };
                } else {
                  return itm;
                }
              }),
            };
          } else {
            return sec;
          }
        });
    });
    if (req.body.siteConfig) {
      const oldSlides = config.siteConfig.landingPage?.hero?.slides || [];
      const reqSlides = req.body.siteConfig.landingPage?.hero?.slides || [];
      const filesToRemove = oldSlides.filter(
        (url) => !reqSlides.some((u) => u === url)
      );
      if (filesToRemove?.length) {
        fileHelper.deleteFiles(filesToRemove);
      }

      const oldDynamicPageFiles = [];
      config.siteConfig.footer?.sections?.forEach((section) => {
        section.items.forEach((item) => {
          oldDynamicPageFiles.push(...item.files);
        });
      });
      const reqDynamicPageFiles = [];
      req.body.siteConfig.footer?.sections?.forEach((section) => {
        section.items.forEach((item) => {
          reqDynamicPageFiles.push(...item.files);
        });
      });
      const dynamicPagesToRemove = oldDynamicPageFiles.filter(
        (url) => !reqDynamicPageFiles.some((u) => u === url)
      );
      if (dynamicPagesToRemove?.length) {
        fileHelper.deleteFiles(dynamicPagesToRemove);
      }
    }

    Config.findOneAndUpdate(conditions, req.body, { new: true })
      .then((data) => {
        if (data) {
          return responseFn.success(res, { data }, responseStr.record_updated);
        } else {
          return responseFn.error(res, {}, responseStr.record_not_found);
        }
      })
      .catch((err) => responseFn.error(res, {}, err.message));
  } catch (error) {
    return responseFn.error(res, {}, error.message, 500);
  }
};
