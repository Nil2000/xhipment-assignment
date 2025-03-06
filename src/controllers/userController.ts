import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import userManager from "../managers/userManager";
import tokenManager from "../managers/tokenManager";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const createUser = async (req: Request, res: Response) => {
  const info = req.body;

  const password = info.password;
  const hashedPassword = await bcrypt.hash(password, 12);

  const userExists = await userManager.checkIfUserExistsWithEmail(info.email);
  if (userExists) {
    res.status(400).send("User with this email already exists");
    return;
  }
  const success = await userManager.createUser({
    username: info.username,
    email: info.email,
    password: hashedPassword,
  });
  if (success) {
    res.status(200).send({
      message: "User registered successfully",
    });
  } else {
    res.status(500).send({
      message: "Failed to create user",
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const info = req.body;

  const userExists = await userManager.checkIfUserExistsWithEmail(info.email);
  if (!userExists) {
    res.status(400).send({
      message: "User with this email does not exist",
    });
    return;
  }

  if (!userExists.password) {
    res.status(500).send({
      message: "User exists but password is missing",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(
    info.password,
    userExists.password
  );

  if (!passwordMatch) {
    res.status(400).send({
      message: "Credentials do not match",
    });
    return;
  }

  const accessToken = await tokenManager.generateAccessToken({
    id: userExists._id.toString(),
    username: userExists.username!,
    email: userExists.email!,
    password: userExists.password!,
  });
  const refreshToken = await tokenManager.generateRefreshToken({
    id: userExists._id.toString(),
    username: userExists.username!,
    email: userExists.email!,
    password: userExists.password!,
  });

  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   sameSite: "strict",
  // });
  res.status(200).send({
    message: "User logged in successfully",
    userId: userExists._id.toString(),
    accessToken,
    refreshToken,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).send({
      message: "No refresh token provided",
    });
    return;
  }

  const validRefreshToken = await tokenManager.checkValidRefreshToken(
    refreshToken
  );

  if (!validRefreshToken) {
    res.status(401).send({
      message: "Invalid refresh token",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as any;
    const accessToken = await tokenManager.generateAccessToken({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      password: decoded.password,
    });
    res.status(200).send({
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
