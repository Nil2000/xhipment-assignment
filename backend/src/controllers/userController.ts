import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import userManager from "../managers/userManager";

export const createUser = async (req: Request, res: Response) => {
  const info = req.body;
  console.log(info);
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

  res.status(200).send({
    message: "User logged in successfully",
  });
};
