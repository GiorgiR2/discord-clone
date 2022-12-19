const mongoose = require("mongoose");

const categoriesSchema = new mongoose.Schema(
  {
    _id: String,
    name: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please add a name"],
    },
    position: {
      type: Number,
      unique: true,
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

const categories = mongoose.model("Categories", categoriesSchema);

module.exports = categories;
