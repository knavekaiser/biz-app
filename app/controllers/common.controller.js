import { appConfig } from "../config/index.js";
import crypto from "crypto";
import { dbHelper } from "../helpers/index.js";

const { responseFn, responseStr } = appConfig;

export const razorpayWebhook = async (req, res) => {
  try {
    console.log("razorpay webhook");
    // console.log(JSON.stringify(req.body, null, 2));

    const signatureHash = req.headers["x-razorpay-signature"];
    if (!signatureHash) {
      return responseFn.error(res, {}, responseStr.unauthorized, 401);
    } else {
      const currentHash = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_WEBHOOK_KEY)
        .update(JSON.stringify(req.body), "utf-8")
        .digest("hex");
      if (signatureHash != currentHash) {
        return responseFn.error(res, {}, "Unauthorized", 401);
      }
    }

    if (req.body.event === "order.paid") {
      const { order } = req.body?.payload;
      const { Model } = await dbHelper.getModel(
        order.entity.notes.business_id + "_Order"
      );
      await Model.findOneAndUpdate(
        { _id: order.entity.notes.order_id, paymentStatus: "pending" },
        { paymentStatus: "paid" }
      );
    }

    responseFn.success(res, {});
  } catch (error) {
    console.log("webhook error", error.message);
    return responseFn.error(res, {}, error.message, 500);
  }
};
