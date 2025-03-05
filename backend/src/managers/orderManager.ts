import { OrderReq } from "../types";
import OrderModel from "../models/orderModel";

class orderManager {
  static async createOrder(order: OrderReq) {
    try {
      const orderFromDb = await OrderModel.create({
        userId: order.userId,
        items: Array.from(order.items).map((item) => ({
          id: item.itemId,
          quantity: item.quantity,
        })),
        totalAmount: order.totalAmount,
      });
      return orderFromDb.id;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async getOrderDetails(orderId: string) {
    try {
      const orderFromDb = await OrderModel.findById(orderId);
      return orderFromDb;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

export default orderManager;
