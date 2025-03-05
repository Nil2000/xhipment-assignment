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
    const oldUser = await User.findOne({
      email,
    });

    return oldUser;
  }

  static async checkIfUserExistsWithId(id: string) {
    const oldUser = await User.findById(id);
    return oldUser;
  }
}

export default userManager;
