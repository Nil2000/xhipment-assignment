import mongoose from "mongoose";
import Item from "./models/itemsModel";
import "dotenv/config";

const uri = process.env.MONGO_URL! + process.env.DB_NAME!;

async function main() {
  try {
    await mongoose.connect(uri);

    await mongoose.connection.db?.dropCollection("items");
    console.log("Items collection dropped");

    const items = [
      { name: "Item 1", quantity: 10, pricing: 100 },
      { name: "Item 2", quantity: 20, pricing: 200 },
      { name: "Item 3", quantity: 30, pricing: 300 },
      { name: "Item 4", quantity: 40, pricing: 400 },
      { name: "Item 5", quantity: 50, pricing: 500 },
    ];

    await Item.insertMany(items);
    console.log("Items seeded successfully");
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
