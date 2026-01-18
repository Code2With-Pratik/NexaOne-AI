import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  PRO: {
    name: "Creator Plan",
    price: 29900, // 👈 FIXED: ₹299.00 (was 2900/₹29)
    credits: 1500
  },
  ULTRA: {
    name: "Agency Plan",
    price: 99900, // 👈 FIXED: ₹999.00 (was 9900/₹99)
    credits: 10000
  }
};