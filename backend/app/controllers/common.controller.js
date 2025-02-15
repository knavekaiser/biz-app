import { appConfig } from "../config/index.js";
import crypto from "crypto";
import { dbHelper } from "../helpers/index.js";

const { responseFn, responseStr } = appConfig;

export const razorpayWebhook = async (req, res) => {
  try {
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
      const { Model } = await dbHelper.getModel({
        companyId: order.entity.notes.business_id,
        finPeriodId: order.entity.notes.fin_period_id,
        name: "Order",
      });
      await Model.findOneAndUpdate(
        { _id: order.entity.notes.order_id, paymentStatus: "pending" },
        { paymentStatus: "paid" }
      );
    }
    if (req.body.event === "payment.authorized") {
      const { payment } = req.body?.payload;
      const { Model } = await dbHelper.getModel({
        companyId: payment.entity.notes.business_id,
        finPeriodId: payment.entity.notes.fin_period_id,
        name: "Order",
      });
      await Model.findOneAndUpdate(
        { _id: payment.entity.payment.order_id, paymentStatus: "pending" },
        { paymentStatus: "paid" }
      );
    }

    responseFn.success(res, {});
  } catch (error) {
    console.log("webhook error", error.message);
    return responseFn.error(res, {}, error.message, 500);
  }
};
