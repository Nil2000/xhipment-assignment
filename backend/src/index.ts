import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/db";
import { authMiddleware } from "./middleware/authMiddleware";

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

connectDB();
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
