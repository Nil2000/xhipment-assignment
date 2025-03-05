import ItemModel from "../models/itemsModel";
import { Item, ItemReq } from "../types";

class itemManager {
  addItem(item: ItemReq) {}

  static async getItem(itemId: string) {
    try {
      const item = await ItemModel.findById(itemId);
      return item;
    } catch (error) {
      console.log("GET_ITEM", error);
      return null;
    }
  }
}

export default itemManager;
