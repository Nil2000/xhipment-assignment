import mongoose from "mongoose";
import User from "../models/userModel";
import bcrypt from "bcryptjs";
type UserRequest = {
  username: string;
  password: string;
  email: string;
};

class userManager {
  static async createUser(info: UserRequest) {
    try {
      await User.create(info);
      return true;
    } catch (error) {
      console.error("CREATE_USER", error);
      return false;
    }
  }

  static async checkIfUserExistsWithEmail(email: string) {
    try {
      const oldUser = await User.findOne({
        email,
      });

      return oldUser;
    } catch (error) {
      return null;
    }
  }

  static async checkIfUserExistsWithId(id: string) {
    try {
      const oldUser = await User.findById(new mongoose.Types.ObjectId(id));
      return oldUser;
    } catch (error) {
      return null;
    }
  }
}

export default userManager;
