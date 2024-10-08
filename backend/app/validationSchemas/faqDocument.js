import yup from "yup";
import { getModel } from "../models/index.js";

export const create = yup.object({
  body: yup.object({
    topic: yup
      .string()
      .required()
      .test("topicNameCheck", async function (v) {
        const req = this.options.context.req;
        const FaqDoc = getModel({
          companyId: (req.business || req.authUser)._id,
          name: "FaqDoc",
        });
        const existingTopic = await FaqDoc.findOne({
          topic: { $regex: new RegExp(v, "i") },
        });
        return (
          !existingTopic ||
          this.createError({
            path: this.path,
            message: `"${v}" already exist. Please, enter a different name.`,
          })
        );
      }),
    files: yup.array().of(yup.mixed()).typeError("files must be an array"),
    urls: yup.array().of(yup.string().url()).typeError("urls must be an array"),
    content: yup.string().nullable(),
    contextForUsers: yup.string().max(200),
    description: yup.string().max(200),
  }),
});
export const update = yup.object({
  body: yup.object({
    topic: yup.string().test("topicNameCheck", async function (v) {
      if (!v) return true;
      const req = this.options.context.req;
      const FaqDoc = getModel({
        companyId: (req.business || req.authUser)._id,
        name: "FaqDoc",
      });
      const existingTopic = await FaqDoc.findOne({
        _id: { $ne: req.params._id },
        topic: { $regex: new RegExp(v, "i") },
      });
      return (
        !existingTopic ||
        this.createError({
          path: this.path,
          message: `"${v}" already exist. Please, enter a different name.`,
        })
      );
    }),
    files: yup.array().of(yup.mixed()).typeError("files must be an array"),
    urls: yup.array().of(yup.string().url()).typeError("urls must be an array"),
    contextForUsers: yup.string().max(200),
    content: yup.string().nullable(),
    description: yup.string().max(200),
    parentTopic: yup
      .string()
      .nullable()
      .objectId()
      .test("parentTopicCheck", "Parent Topic does not exist", function (v) {
        const req = this.options.context.req;
        const FaqDoc = getModel({
          companyId: (req.business || req.authUser)._id,
          name: "FaqDoc",
        });
        return !v || FaqDoc.findOne({ _id: v });
      })
      .test(
        "parentTopicCheck",
        "Parent topic can't be the same one as child topic",
        function (v) {
          return !v || this.options.context.req.params._id !== v;
        }
      ),
  }),
});
export const generateUserContext = yup.object({
  body: yup.object({
    prompt: yup.string().max(300).required(),
  }),
  params: yup.object({
    _id: yup
      .string()
      .objectId()
      .test("check", "Topic not found", function (v) {
        const req = this.options.context.req;
        const FaqDoc = getModel({
          companyId: (req.business || req.authUser)._id,
          name: "FaqDoc",
        });
        return FaqDoc.findOne({ _id: v });
      })
      .required(),
  }),
});
