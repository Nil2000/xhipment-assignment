import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: String,
  expires: {
    type: Date,
    default: Date.now(),
  },
  userId: {
    unique: true,
    type: mongoose.Schema.Types.ObjectId,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const refreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);

export default refreshTokenModel;
