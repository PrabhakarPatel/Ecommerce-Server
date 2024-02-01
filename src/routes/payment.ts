import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import {
  allCoupon,
  applyDiscount,
  createPaymentIntent,
  deleteCoupon,
  newCoupon,
} from "../controllers/payment.js";

const app = express.Router();

//create new coupon - api/v1/payment/create
app.post("/create", createPaymentIntent);

//apply discount coupon - api/v1/payment/discount
app.get("/discount", applyDiscount);

//create new coupon - api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupon);

//all coupon - api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly, allCoupon);

//coupon - api/v1/payment/coupon/:id
app.route("/coupon/:id").delete(adminOnly, deleteCoupon);

export default app;
