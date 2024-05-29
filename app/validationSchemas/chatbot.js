import yup from "yup";
import { User } from "../models/index.js";
import { ObjectId } from "mongodb";

export const update = yup.object({
  body: yup.object({
    avatar: yup.mixed(),
    display_name: yup.string().max(25),
    domain: yup
      .string()
      .max(75)
      .test("domain", "Domain already in use", async function (v) {
        if (!v) {
          return true;
        }
        return await User.aggregate([
          {
            $match: {
              "chatbots._id": {
                $ne: ObjectId(this.options.context.req.params._id),
              },
              "chatbots.domain": v,
            },
          },
        ]).then(([chatbot]) => !chatbot);
      }),
    primaryColor: yup.string().max(10),
  }),
});
