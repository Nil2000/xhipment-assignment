import { OrderReq, OrderStatus } from "../types";
import OrderModel from "../models/orderModel";
import mongoose from "mongoose";
import {
  deleteValueFromRedis,
  getValueFromRedis,
  setValueInRedis,
} from "../services/redis-service";

class orderManager {
  static async createOrder(order: OrderReq) {
    try {
      const orderFromDb = await OrderModel.create({
        userId: order.userId,
        items: Array.from(order.items).map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        totalAmount: order.totalAmount,
      });
      await setValueInRedis(orderFromDb._id.toString(), orderFromDb);
      return orderFromDb;
    } catch (error) {
      console.log("ORDER_CREATE_ERROR", error);
      return null;
    }
  }

  static async getOrderDetails(orderId: string) {
    try {
      const orderFromCache = await getValueFromRedis(orderId);
      if (orderFromCache) {
        return orderFromCache;
      }
      const orderFromDb = await OrderModel.findById(
        new mongoose.Types.ObjectId(orderId)
      );
      return orderFromDb;
    } catch (error) {
      console.log("GET_ORDER_DETAILS_ERROR", error);
      return null;
    }
  }

  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
      console.log("Updating order status for", orderId);
      await OrderModel.findByIdAndUpdate(new mongoose.Types.ObjectId(orderId), {
        status: status,
      });

      const orderFromDb = await OrderModel.findById(
        new mongoose.Types.ObjectId(orderId)
      );
      await deleteValueFromRedis(orderId);
      await setValueInRedis(orderId, orderFromDb);
    } catch (error) {
      console.log("UPDATE_ORDER_STATUS_ERROR", error);
      throw new Error("UPDATE_ORDER_STATUS_ERROR");
    }
  }
}

export default orderManager;
