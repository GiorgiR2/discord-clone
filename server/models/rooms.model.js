const mongoose = require("mongoose");

const roomsSchema = new mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      trim: true,
      unique: false,
      required: [true, "Please add a name"],
    },
    position: {
      type: Number,
      unique: false,
      required: false,
    },
    voice: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: false,
  }
);

const rooms = mongoose.model("Rooms", roomsSchema);

module.exports = rooms;
