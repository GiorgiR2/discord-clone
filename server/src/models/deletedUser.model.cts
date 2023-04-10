import mongoose, { Types } from "mongoose";

interface deletedUserSchemaI extends mongoose.Document {
  _id: Types.ObjectId;
  username: string;
  password: string;
  imageDir: null | string;
  status: "user" | "admin";
  ip: string;
  hashId: string;
}

const deletedUserSchema = new mongoose.Schema<deletedUserSchemaI>(
  {
    username: {
      type: String,
    },
    ip: {
      type: String,
    },
  },
  {
    timestamps: false,
  }
);

const DeletedUser = mongoose.model<deletedUserSchemaI>("DeletedUser", deletedUserSchema);

export default DeletedUser;
export { deletedUserSchemaI };