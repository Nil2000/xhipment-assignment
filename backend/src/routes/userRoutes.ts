import express from "express";
import { createUser, loginUser } from "../controllers/userController";

const authRoutes = express.Router();

authRoutes.post("/register", createUser);
authRoutes.post("/login", loginUser);

export default authRoutes;
