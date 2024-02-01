import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controllers/order.js";
const app = express.Router();

//create new order - api/v1/order/new
app.post("/new", newOrder);

//get my order - api/v1/order/new
app.get("/my", myOrders);

//get my order - api/v1/order/new
app.get("/all", adminOnly, allOrders);

//get my order - api/v1/order/new
app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, processOrder)
  .delete(adminOnly, deleteOrder);

export default app;
