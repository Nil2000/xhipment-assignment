import express from "express";
import { createOrder, getOrderDetails } from "../controllers/orderController";

const orderRoutes = express.Router();

orderRoutes.post("/", createOrder);
orderRoutes.get("/:id", getOrderDetails);

export default orderRoutes;
