import mongoose from "mongoose";

interface roomsSchemaI extends mongoose.Document{
  _id: string;
  name: string;
  position: number;
  voice?: boolean;
}

const roomsSchema = new mongoose.Schema<roomsSchemaI>(
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

const rooms = mongoose.model<roomsSchemaI>("Rooms", roomsSchema);

// module.exports = rooms;
export default rooms;
export { roomsSchemaI };