import mongoose from "mongoose";

const uniformSchema = new mongoose.Schema({
  subCategory: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Unisex"], required: true },
  variations: [
    {
      variationType: { type: String, required: true },
      variationInfo: { type: String, required: true },
      secondVariationType: { type: String },
      secondVariationInfo: { type: String },
      subVariations: [
        {
          subVariationType: { type: String },
          subVariationInfo: { type: String },
          stockQty: { type: Number, default: 1 },
          price: { type: Number },
        },
      ],
    },
  ],
});

const bookSchema = new mongoose.Schema({
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  stockQty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
});

const stationarySchema = new mongoose.Schema({
  stockQty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    category: {
      type: String,
      enum: ["Uniform", "Books", "Stationary"],
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    productDetail: { type: String, required: true },
    SKU: { type: String, required: true, unique: true },
    image: [{ type: String, required: true }],
    uniformDetails: { type: uniformSchema, required: function () { return this.category === "Uniform"; } },
    bookDetails: { type: bookSchema, required: function () { return this.category === "Books"; } },
    stationaryDetails: { type: stationarySchema, required: function () { return this.category === "Stationary"; } },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
