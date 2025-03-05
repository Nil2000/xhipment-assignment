import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION_SECONDS,
} from "../constants";
import { UserFromDb } from "../types";
import jwt from "jsonwebtoken";
import "dotenv/config";
import refreshTokenModel from "../models/refreshTokenModel";

class tokenManager {
  static async generateAccessToken(user: UserFromDb) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  }

  static async generateRefreshToken(user: UserFromDb) {
    await this.deleteRefreshToken(user);

    const newRefreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    await this.saveRefreshToken(user, newRefreshToken);
    return newRefreshToken;
  }

  static async saveRefreshToken(user: UserFromDb, refreshToken: string) {
    await refreshTokenModel.create({
      token: refreshToken,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_SECONDS),
      userId: user.id,
    });
  }

  static async deleteRefreshToken(user: UserFromDb) {
    await refreshTokenModel.findOneAndDelete({
      userId: user.id,
    });
  }

  static async checkValidRefreshToken(token: string) {
    const refreshToken = await refreshTokenModel.findOne({ token });
    return !!refreshToken;
  }
}

export default tokenManager;
