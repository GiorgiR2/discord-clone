// const { kStringMaxLength } = require("buffer");
import mongoose, { Types } from "mongoose";

interface userSchemaI extends mongoose.Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  imageDir: null | string;
  status: "user" | "admin";
  ip: string;
  hashId: string;
}

const userSchema = new mongoose.Schema<userSchemaI>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: {
      type: String,
      required: [true, "Please add a username"],
      unique: true,
      trim: true,
      minwidth: 3,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      unique: false,
      trim: true,
    },
    imageDir: {
      type: String,
      required: true,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      default: "user",
      unique: false,
      trim: false,
    },
    ip: {
      type: String,
      required: false,
      unique: false,
      trim: true,
    },
    hashId: {
      type: String,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: false,
  }
);

const User = mongoose.model<userSchemaI>("User", userSchema);

// module.exports = User;
export default User;
export { userSchemaI };
