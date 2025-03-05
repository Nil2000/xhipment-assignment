import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import "dotenv/config";

export const sqs = new SQSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendMessageToQueue(messageBody: any) {
  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(messageBody),
    });

    const response = await sqs.send(command);
    console.log("Message sent successfully:", response.MessageId);
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
}
