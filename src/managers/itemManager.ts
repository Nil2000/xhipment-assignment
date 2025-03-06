import mongoose from "mongoose";
import ItemModel from "../models/itemsModel";
import { Item, ItemReq } from "../types";

class itemManager {
  addItem(item: ItemReq) {}

  static async getItem(itemId: string) {
    try {
      const item = await ItemModel.findById(
        new mongoose.Types.ObjectId(itemId)
      );
      return item;
    } catch (error) {
      console.log("GET_ITEM_ERROR", error);
      return null;
    }
  }

  static async updateItem(itemId: string, quantity: number) {
    try {
      await ItemModel.findByIdAndUpdate(new mongoose.Types.ObjectId(itemId), {
        quantity: quantity,
      });
    } catch (error) {
      console.log("UPDATE_ITEM_ERROR", error);
      throw new Error("UPDATE_ITEM_ERROR");
    }
  }
}

export default itemManager;
