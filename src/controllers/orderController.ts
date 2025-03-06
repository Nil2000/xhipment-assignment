import { Request, Response } from "express";
import userManager from "../managers/userManager";
import { ItemReq } from "../types";
import itemManager from "../managers/itemManager";
import orderManager from "../managers/orderManager";
import { sendMessageToQueue } from "../services/queue-service";

export const createOrder = async (req: Request, res: Response) => {
  const { userId, items, totalAmount } = req.body;

  if (
    !userId ||
    !items ||
    typeof totalAmount !== "number" ||
    totalAmount <= 0
  ) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "Items list cannot be empty" });
    return;
  }
  try {
    const userExists = await userManager.checkIfUserExistsWithId(userId);
    if (!userExists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (typeof items !== "object" || !Array.isArray(items)) {
      res.status(400).json({ message: "Not a valid item list" });
      return;
    }

    let expectedTotal = 0;
    let validatedItems = [];

    for (const item of items) {
      if (
        !item.id ||
        !item.quantity ||
        item.quantity < 1 ||
        Number.isInteger(item.quantity) === false
      ) {
        res.status(400).json({ message: "Invalid item format" });
        return;
      }

      const itemFromDb = await itemManager.getItem(item.id);
      if (!itemFromDb) {
        res.status(404).json({ message: `Item with id ${item.id} not found` });
        return;
      }

      if (itemFromDb.quantity! < item.quantity) {
        res.status(400).json({
          message: `Item: ${itemFromDb.name} has insufficient stock`,
        });
        return;
      }

      expectedTotal += itemFromDb.pricing! * item.quantity;
      validatedItems.push({
        itemId: item.id,
        quantity: item.quantity,
      });
    }

    // Check total amount consistency
    if (expectedTotal !== totalAmount) {
      res.status(400).json({
        message: `Total amount mismatch. Expected: ${expectedTotal}, Provided: ${totalAmount}`,
      });
      return;
    }

    // Create order
    const newOrder = await orderManager.createOrder({
      userId,
      items: validatedItems,
      totalAmount,
    });

    if (!newOrder) {
      res.status(500).json({ message: "Error creating order" });
      return;
    }

    //Push to sqs queue
    await sendMessageToQueue({
      id: newOrder._id.toString(),
      userId,
      items: validatedItems,
      totalAmount,
    });

    res.status(201).json({
      message: "Order created successfully",
      orderId: newOrder._id.toString(),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  const orderId = req.params.id;

  if (!orderId) {
    res.status(400).json({ message: "Invalid request" });
    return;
  }

  const order = await orderManager.getOrderDetails(orderId);

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.status(200).json({ order });
};
