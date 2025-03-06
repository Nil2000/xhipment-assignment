import itemManager from "./managers/itemManager";
import orderManager from "./managers/orderManager";
import { Order } from "./types";

export const processStockTransaction = async (order: Order): Promise<void> => {
    let result=[];
    try {
        const {items}=order;
        for(const item of items){
            const itemFromDb=await itemManager.getItem(item.itemId);
            if(!itemFromDb){
                throw new Error("ITEM_NOT_FOUND");
            }
            if(itemFromDb.quantity!<item.quantity){
                throw new Error("INSUFFICIENT_STOCK");
            }
            result.push({
                itemId:item.itemId,
                quantity:itemFromDb.quantity!-item.quantity
            });
        }
        for(const item of result){
            await itemManager.updateItem(item.itemId,item.quantity);
        }
        await orderManager.updateOrderStatus(order.id,"PROCESSED");
    } catch (error) {
        if (error instanceof Error && error.message !== "ITEM_NOT_FOUND" && error.message !== "INSUFFICIENT_STOCK") {
            console.log("PROCESS_STOCK_TRANSACTION_ERROR",error);
        }
        await orderManager.updateOrderStatus(order.id,"FAILED");
    }
}