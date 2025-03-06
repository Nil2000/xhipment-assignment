import { NextFunction, Request, Response } from "express";
import tokenManager from "../managers/tokenManager";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { publicRoutes } from "../constants";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).send({ error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).send({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);

    req.user = decoded;
    return next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
