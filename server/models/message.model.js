const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
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
  },
  {
    timestamps: false,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
