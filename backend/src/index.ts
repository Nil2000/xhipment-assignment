import express from "express";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/db";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", userRoutes);

connectDB();
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
