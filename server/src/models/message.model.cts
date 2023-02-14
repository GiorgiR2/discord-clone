import mongoose, { Types } from "mongoose";
import { emojiT } from "../types/sockets";

interface emojiI {
  emoji: emojiT,
  num: number,
  users: string[],
}

// mongoose.Document, mongodb.collection
interface messageSchemaI extends mongoose.Document {
  _id: Types.ObjectId;
  date: string;
  message?: string;
  user: string;
  room: string;
  roomId: string;
  isFile?: boolean;
  path?: string;
  originalName?: string;
  downloadCount?: number;
  size?: number;
  edited: boolean;
  emojis: emojiI[];//Record<emojiT, number>;
  number: number;
}

const messageSchema = new mongoose.Schema<messageSchemaI>(
  {
    _id: mongoose.Schema.Types.ObjectId,
    date: {
      type: String,
      unique: false,
      trim: true,
      required: [true, "Please add date"],
    },
    message: {
      type: String,
      unique: false,
      trim: true,
      required: false,
    },
    user: {
      type: String,
      unique: false,
      trim: true,
      required: [true, "Please add a username"],
    },
    room: {
      type: String,
      unique: false,
      trim: true,
      required: [true, "Please add a room name"],
    },
    roomId: {
      type: String,
      trim: true,
      unique: false,
      required: [true, "Please add a room id"],
    },
    isFile: {
      type: Boolean,
      unique: false,
      required: true,
    },
    path: {
      type: String,
      unique: false,
      required: false,
    },
    originalName: {
      type: String,
      trim: true,
      unique: false,
      required: false,
    },
    downloadCount: {
      type: Number,
      unique: false,
      required: false,
    },
    size: {
      type: Number,
      unique: false,
      required: false,
    },
    edited: {
      type: Boolean,
      unique: false,
      required: true,
      default: false,
    },
    emojis: [{
      emoji: String,
      num: Number,
      users: [String],
    }],
    number: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

const Message = mongoose.model<messageSchemaI>("Message", messageSchema);

// module.exports = Message;
export default Message;
export { messageSchemaI };