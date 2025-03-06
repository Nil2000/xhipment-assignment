import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/db";
import { authMiddleware } from "./middleware/authMiddleware";
import orderRoutes from "./routes/orderRoutes";

const app = express();
app.use(express.json());

app.use(authMiddleware);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/test", (req, res) => {
  res.send("Test route");
});

app.use("/api/auth", userRoutes);
app.use("/api/orders", orderRoutes);

async function startServer() {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
