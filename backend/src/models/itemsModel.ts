import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  pricing: Number,
});

const ItemModel = mongoose.model("Item", itemSchema);

export default ItemModel;
