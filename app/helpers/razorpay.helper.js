import Razorpay from "razorpay";

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

export const createOrder = ({ business_id, order_id, amount }) => {
  return new Promise((resolve, reject) => {
    instance.orders.create(
      {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        notes: {
          business_id,
          order_id,
        },
      },
      function (err, order) {
        if (err) {
          return reject(err);
        }
        resolve(order);
      }
    );
  });
};
