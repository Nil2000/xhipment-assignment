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

export const processStockTransaction = async (order: Order): Promise<void> => {
  let result = [];
  try {
    const { items } = order;
    for (const item of items) {
      const itemFromDb = await itemManager.getItem(item.itemId);
      if (!itemFromDb) {
        throw new Error("ITEM_NOT_FOUND");
      }
      if (itemFromDb.quantity! < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }
      result.push({
        itemId: item.itemId,
        quantity: itemFromDb.quantity! - item.quantity,
      });
    }
    for (const item of result) {
      await itemManager.updateItem(item.itemId, item.quantity);
    }
    await orderManager.updateOrderStatus(order.id, "PROCESSED");

    const emailOfCustomer = await userManager.getUserEmailById(order.userId);

    await sendEmail(
      process.env.AWS_SES_VERIFIED_EMAIL!,
      [emailOfCustomer!],
      generateEmailTemplate(order, "PROCESSED")
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message !== "ITEM_NOT_FOUND" &&
      error.message !== "INSUFFICIENT_STOCK"
    ) {
      console.log("PROCESS_STOCK_TRANSACTION_ERROR", error);
    }
    await orderManager.updateOrderStatus(order.id, "FAILED");

    const emailOfCustomer = await userManager.getUserEmailById(order.userId);

    await sendEmail(
      process.env.AWS_SES_VERIFIED_EMAIL!,
      [emailOfCustomer!],
      generateEmailTemplate(order, "FAILED")
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
    });

    const response = await sqs.send(receiveMessageCommand);
    const messages = response.Messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const receiptHandle = message.ReceiptHandle;
      let retries = 0;
      let success = false;

      while (retries < QUEUE_MESSAGE_RETRY_LIMIT && !success) {
        try {
          console.log("Processing message:", message);
          // processStockTransaction(message);
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
  while (true) {
    await pollMessageFromQueue();
  }
}

startWorker();
