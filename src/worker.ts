import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "./services/queue-service";
import { QUEUE_MESSAGE_RETRY_LIMIT } from "./constants";
import itemManager from "./managers/itemManager";
import orderManager from "./managers/orderManager";
import { Order } from "./types";
import { sendEmail } from "./services/email-service";
import userManager from "./managers/userManager";
import { generateEmailTemplate } from "./services/email-template-service";
import connectDB from "./config/db";

export const processStockTransaction = async (
  order: Omit<Order, "status">
): Promise<void> => {
  let result = [];
  try {
    const { items } = order;
    const itemQuantities: { [key: string]: number } = {};

    // Calculate total quantities for each item
    for (const item of items) {
      if (!itemQuantities[item.itemId]) {
        itemQuantities[item.itemId] = 0;
      }
      itemQuantities[item.itemId] += item.quantity;
    }

    // Check stock and update quantities
    for (const itemId in itemQuantities) {
      const itemFromDb = await itemManager.getItem(itemId);
      if (!itemFromDb) {
        throw new Error("ITEM_NOT_FOUND");
      }
      if (itemFromDb.quantity! < itemQuantities[itemId]) {
        throw new Error("INSUFFICIENT_STOCK");
      }
      result.push({
        itemId,
        quantity: itemFromDb.quantity! - itemQuantities[itemId],
      });
    }

    for (const item of result) {
      await itemManager.updateItem(item.itemId, item.quantity);
    }
    await orderManager.updateOrderStatus(order.id, "PROCESSED");

    const emailOfCustomer = await userManager.getUserEmailById(order.userId);

    const emailMessage = await generateEmailTemplate(order, "PROCESSED");

    await sendEmail(
      process.env.AWS_SES_VERIFIED_EMAIL!,
      [emailOfCustomer!],
      emailMessage
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message !== "ITEM_NOT_FOUND" &&
      error.message !== "INSUFFICIENT_STOCK"
    ) {
      console.error("PROCESS_STOCK_TRANSACTION_ERROR", error);
    }
    await orderManager.updateOrderStatus(order.id, "FAILED");

    const emailOfCustomer = await userManager.getUserEmailById(order.userId);

    const emailMessage = await generateEmailTemplate(order, "FAILED");

    await sendEmail(
      process.env.AWS_SES_VERIFIED_EMAIL!,
      [emailOfCustomer!],
      emailMessage
    );
  }
};

async function deleteMessage(receiptHandle: string) {
  const deleteMessageCommand = new DeleteMessageCommand({
    QueueUrl: process.env.AWS_SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle,
  });
  await sqs.send(deleteMessageCommand);
}

async function pollMessageFromQueue() {
  try {
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 10,
      VisibilityTimeout: 10,
    });

    const response = await sqs.send(receiveMessageCommand);
    const messages = response.Messages;

    console.log("Received messages:", messages);

    if (messages && messages.length > 0) {
      const message = messages[0];
      const receiptHandle = message.ReceiptHandle;
      let retries = 0;
      let success = false;

      while (retries < QUEUE_MESSAGE_RETRY_LIMIT && !success) {
        try {
          if (message.Body) {
            await processStockTransaction(JSON.parse(message.Body));
          }
          await deleteMessage(receiptHandle!);
          success = true;
        } catch (error) {
          retries++;
          console.error(`Error processing message, attempt ${retries}:`, error);
        }
      }

      if (!success) {
        console.error(
          "Failed to process message after 3 attempts, deleting message."
        );
        await deleteMessage(receiptHandle!);
      }
    }
  } catch (error) {
    console.error("Error receiving message from SQS:", error);
  }
}

async function startWorker() {
  try {
    await connectDB();
    while (true) {
      console.log("Listening for messages in SQS...");
      await pollMessageFromQueue();
    }
  } catch (error) {
    console.error("Error starting worker:", error);
    process.exit(1);
  }
}

startWorker();
