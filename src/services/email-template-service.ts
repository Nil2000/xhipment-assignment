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
            <td>${itemInfo.name}</td>
            <td>${item.quantity}</td>
            <td>${itemInfo.pricing}</td>
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
                    <head></head>
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
