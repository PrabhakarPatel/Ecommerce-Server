import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount, shippingInfo, name } = req.body;
  const { address, pinCode, state, country, city } = shippingInfo;
  console.log(pinCode);
  if (!amount)
    return next(new ErrorHandler("Please enter both coupon and amount", 400));
  const paymentIntent = await stripe.paymentIntents.create({
    shipping: {
      name: name,
      address: {
        line1: address,
        postal_code: pinCode,
        city: city,
        state: state,
        country: country,
      },
    },
    amount: Number(amount * 100),
    currency: "inr",
    payment_method_types: ["card"],
  });
  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });
});

export const newCoupon = TryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;
  if (!coupon || !amount)
    return next(new ErrorHandler("Please enter both coupon and amount", 400));
  await Coupon.create({
    amount,
    code: coupon,
  });
  return res.status(201).json({
    success: true,
    message: `Coupon ${coupon} created successfully`,
  });
});

export const applyDiscount = TryCatch(async (req, res, next) => {
  const { coupon } = req.query;
  const discount = await Coupon.findOne({ code: coupon });
  if (!discount)
    return next(new ErrorHandler("Please enter a valid Coupon", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});
export const allCoupon = TryCatch(async (req, res, next) => {
  const allCoupon = await Coupon.find();
  if (!allCoupon) return next(new ErrorHandler("Not have Coupon", 400));

  return res.status(200).json({
    success: true,
    allCoupon,
  });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return next(new ErrorHandler("Invalid Coupon ID", 400));
  return res.status(200).json({
    success: true,
    message: `Coupon ${coupon?.code} Deleted Successfully`,
  });
});
