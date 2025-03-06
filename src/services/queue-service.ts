import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import "dotenv/config";
import { Order } from "../types";

export const sqs = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendMessageToQueue(messageBody: Omit<Order, "status">) {
  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
      MessageGroupId: "order",
      MessageDeduplicationId: messageBody.id,
    });

    const response = await sqs.send(command);
    console.log("Message sent successfully:", response.MessageId);
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
}
