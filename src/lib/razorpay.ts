import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  PRO: {
    name: "Pro Plan",
    price: 2900, // ₹29.00 (in paise)
    credits: 1500
  },
  ULTRA: {
    name: "Ultra Plan",
    price: 9900, // ₹99.00 (in paise)
    credits: 10000
  }
}; 