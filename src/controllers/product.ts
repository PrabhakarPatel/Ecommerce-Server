import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  SearchRequestQuery,
  newProductRequestBody,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidatesCache } from "../utils/features.js";

//revalidate on new ,update or delete, newOrder
export const getLatestProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-product"))
    products = JSON.parse(myCache.get("latest-product") as string);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-product", JSON.stringify(products));
  }
  return res.status(200).json({ success: true, products });
});
//revalidate on new ,update or delete,on a newOrder
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({ success: true, categories });
});
//revalidate on new ,update or delete,on a newOrder
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await Product.find({});
    if (!products) return next(new ErrorHandler("Products not found", 404));
    myCache.set("all-products", JSON.stringify(products));
  }
  return res.status(200).json({ success: true, products });
});

//revalidate on new ,update or delete,on a newOrder
export const getSingleProducts = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product not found", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({ success: true, product });
});
//create a new product
export const newProduct = TryCatch(
  async (req: Request<{}, {}, newProductRequestBody>, res, next) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;
    if (!photo) return next(new ErrorHandler("Please add photo", 400));
    if (!name || !category || !price || !stock) {
      rm(photo.path, () => {
        console.log("Deleted");
      });
      return next(new ErrorHandler("please enter all field", 400));
    }
    await Product.create({
      name,
      category: category.toLowerCase(),
      price,
      stock,
      photo: photo.path,
    });
    invalidatesCache({ product: true, admin: true });
    return res
      .status(201)
      .json({ success: true, message: "Product created successfully" });
  }
);
//update a product
export const updateProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const { name, category, price, stock } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Invalid product not found", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old Photo Deleted");
    });
    product.photo = photo.path;
  }
  if (name) product.name = name;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();
  invalidatesCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res
    .status(200)
    .json({ success: true, message: "Product updated successfully" });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Invalid product not found", 404));
  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });
  await product.deleteOne();
  invalidatesCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res
    .status(200)
    .json({ success: true, message: "product deleted successfully" });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, price, category } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = limit * (page - 1);

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    if (price) baseQuery.price = { $lte: Number(price) };

    if (category) baseQuery.category = category;

    const ProductsPromise = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? -1 : 1 })
      .limit(limit)
      .skip(skip);
    const [products, filteredOnlyProducts] = await Promise.all([
      ProductsPromise,
      Product.find(baseQuery),
    ]);

    const totalpage = Math.ceil(filteredOnlyProducts.length / limit);
    return res.status(200).json({ success: true, products, totalpage });
  }
);
