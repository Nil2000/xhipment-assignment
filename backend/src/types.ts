import { ObjectId } from "mongoose";

export type UserFromDb = {
  id: string;
  username: string;
  email: string;
  password: string;
};
