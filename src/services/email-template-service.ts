import { Message } from "@aws-sdk/client-ses";
import { Order, OrderStatus } from "../types";
import itemManager from "../managers/itemManager";

type Item = {
  itemId: string;
  quantity: number;
};

const getItemsForEmailAndSetUpRow = async (items: Item[]) => {
  let itemsStyled = "";
  for (const item of items) {
    const itemInfo = await itemManager.getItem(item.itemId);

    if (!itemInfo) {
      return "";
    }

    itemsStyled += `
        <tr>
            <td style="border: 1px solid #dddddd; text-align: center; padding: 8px;">${itemInfo.name}</td>
            <td style="border: 1px solid #dddddd; text-align: center; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #dddddd; text-align: center; padding: 8px;">${itemInfo.pricing}</td>
        </tr>`;
  }
  return itemsStyled;
};

export async function generateEmailTemplate(
  order: Omit<Order, "status">,
  updateStatus: OrderStatus
): Promise<Message> {
  const itemsStyled = await getItemsForEmailAndSetUpRow(order.items);

  return {
    Subject: {
      Data: `Your order ${order.id} has been updated`,
      Charset: "UTF-8",
    },
    Body: {
      Html: {
        Data: `
                <html>
                    <head>
                        <style>
                            table {
                                font-family: Arial, sans-serif;
                                border-collapse: collapse;
                                width: 100%;
                            }
                            th {
                                border: 1px solid #dddddd;
                                text-align: center;
                                padding: 8px;
                                background-color: #f2f2f2;
                            }
                            td {
                                border: 1px solid #dddddd;
                                text-align: center;
                                padding: 8px;
                            }
                            tr:nth-child(even) {
                                background-color: #f2f2f2;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Your order status has been updated</h1>
                        <p>Order ID: ${order.id}</p>
                        <table>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                            </tr>
                            ${itemsStyled}
                            <tr>
                                <td>Total</td>
                                <td></td>
                                <td>${order.totalAmount}</td>
                            </tr>
                        </table>
                        <p>Order Status: ${updateStatus}</p>
                    </body>
                </html>
                `,
        Charset: "UTF-8",
      },
    },
  };
}
