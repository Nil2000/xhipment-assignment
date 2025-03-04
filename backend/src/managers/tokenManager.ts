import {
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
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
    const newRefreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    await this.saveRefreshToken(user, newRefreshToken);
    return newRefreshToken;
  }

  static async saveRefreshToken(user: UserFromDb, refreshToken: string) {
    await refreshTokenModel.create({
      token: refreshToken,
      expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
      userId: user.id,
    });
  }

  static async deleteRefreshToken(user: UserFromDb) {
    await refreshTokenModel.findOneAndDelete({
      userId: user.id,
    });
  }

  static async getRefreshToken(user: UserFromDb) {
    const oldRefreshToken = await refreshTokenModel.findOne({
      userId: user.id,
    });

    if (!oldRefreshToken) {
      const newRefreshToken = await this.generateRefreshToken(user);
      return newRefreshToken;
    }

    if (oldRefreshToken && oldRefreshToken.expires! < new Date(Date.now())) {
      await this.deleteRefreshToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);
      return newRefreshToken;
    }
    return oldRefreshToken.token;
  }

  static async verifyAccessToken(token: string) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return {
            error: "TokenExpiredError",
          };
        } else if (err.name === "JsonWebTokenError") {
          return {
            error: "JsonWebTokenError",
          };
        }
        return {
          error: "InvalidToken",
        };
      }
      return user;
    });
  }

  static async verifyRefreshToken(token: string) {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return {
            error: "TokenExpiredError",
          };
        } else if (err.name === "JsonWebTokenError") {
          return {
            error: "JsonWebTokenError",
          };
        }
        return {
          error: "InvalidToken",
        };
      }
      return user;
    });
  }
}

export default tokenManager;
