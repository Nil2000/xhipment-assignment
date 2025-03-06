import { Message, SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

export const ses = new SESClient({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})

export async function sendEmail(source: string, to: string[], messageBody: Message) {
    try {
        const command = new SendEmailCommand({
            Source: source,
            Destination: {
                ToAddresses: to,
                CcAddresses: to
            },
            Message: messageBody
        })

        await ses.send(command)
    } catch (caught) {
        console.error("Error sending email to SES:", caught)
    }
}