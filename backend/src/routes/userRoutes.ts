import express from "express";
import {
  createUser,
  loginUser,
  refreshToken,
} from "../controllers/userController";

const authRoutes = express.Router();

authRoutes.post("/register", createUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/refresh", refreshToken);

export default authRoutes;
