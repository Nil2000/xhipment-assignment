import { ObjectId } from "mongoose";

export type UserFromDb = {
  id: string;
  username: string;
  email: string;
  password: string;
};

export type OrderStatus = "PENDING" | "PROCESSED" | "FAILED";

export type Order = {
  id: string;
  userId: string;
  items: Array<{ itemId: string; quantity: number }>;
  totalAmount: number;
  status: OrderStatus;
};

export type OrderReq = Omit<Order, "id" | "status">;

export type Item = {
  quantity: number;
  pricing: number;
  name: string;
};

export type ItemReq = Omit<Item, "name" | "pricing"> & { id: string };
