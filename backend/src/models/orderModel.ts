import mongoose from "mongoose";
import Item from "./itemsModel";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: Item, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "PROCESSED", "FAILED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
