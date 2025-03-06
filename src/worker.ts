import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { sqs } from "./services/queue-service";
import { QUEUE_MESSAGE_RETRY_LIMIT } from "./constants";

async function processMessage(message: any) {
  console.log("Processing message:", message);
}

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
          processMessage(message);
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
