import express from "express";

import { adminOnly } from "../middlewares/auth.js";
import {
  deleteProduct,
  getAdminProducts,
  getAllCategories,
  getAllProducts,
  getLatestProduct,
  getSingleProducts,
  newProduct,
  updateProduct,
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express.Router();
//create new product - api/v1/product/new
app.post("/new", adminOnly, singleUpload, newProduct);
//To get last 5 products - api/v1/product/latest
app.get("/latest", getLatestProduct);
//To get all products with filter only - api/v1/product/all
app.get("/all", getAllProducts);
//To get all uniquie products - api/v1/product/categories
app.get("/categories", getAllCategories);
//To get all products - api/v1/product/admin-products
app.get("/admin-products", adminOnly, getAdminProducts);
//
app
  .route("/:id")
  .get(getSingleProducts)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

export default app;
