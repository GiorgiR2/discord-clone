const express = require("express");
const bp = require("body-parser");
const mongoose = require("mongoose");

const RoomsModel = require("../models/rooms.model");
const { saveModel } = require("../js/saveModel");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET requests to /users...",
  });
});

router.post("/api/roomId", async (req, res) => {
  try {
    let name = await RoomsModel.find({
      _id: req.body.id,
    }).exec();

    await res.send({
      roomName: name[0].name,
      voiceMode: name[0].voice,
    });
    console.log("sent", name[0].name);
  } catch {
    await res.send({ roomName: "try_again" });
  }
});

router.post("/api/editCategory", async (req, res) => {
  const catId = req.body.catId;
  const newCatName = req.body.newCatName;

  // console.log("catId:", catId);
  // console.log("newCatName:", newCatName);
  try {
    await RoomsModel.updateOne(
      {
        _id: catId,
      },
      {
        $set: {
          name: newCatName,
        },
      }
    );

    await res.send({ status: "done" });
  } catch {
    await res.send({ status: "try_again" });
  }
});

router.post("/api/addCategory", async (req, res) => {
  // try {
  let roomsN;
  RoomsModel.count({}, async (err, count) => {
    // console.log(count);
    // roomsN = count;
    let newRoomModel = new RoomsModel({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      position: count + 1,
      voice: req.body.voice,
    });

    // console.log(newCategoryModel._id);
    await saveModel(newRoomModel);
    await res.send({
      status: "done",
      _id: newCategoryModel._id,
      position: newRoomModel.position,
    });
  });
  // console.log("count:", roomsN);
  // return;
  // } catch {
  //   await res.send({ status: "try_again" });
  // }
});

router.post("/api/changeRoomPosition", async (req, res) => {
  let roomId = req.body.roomId;
  let draggingRoomIndex = req.body.draggingRoomIndex;
  let finalIndex = req.body.finalIndex;

  if (finalIndex === draggingRoomIndex) {
    return;
  }

  let filter = { _id: roomId };
  let update = { position: 1001 };
  console.log(
    `draggingRoomIndex: ${draggingRoomIndex}; finalIndex: ${finalIndex};`
  );
  await RoomsModel.findOneAndUpdate(filter, update).exec();

  let doc = await RoomsModel.find().sort({ position: 1 }).exec();
  if (finalIndex > draggingRoomIndex) {
    doc.forEach((room, n) => {
      if (
        room.position > draggingRoomIndex &&
        room.position <= finalIndex + 1
      ) {
        // filter = { _id: room._id };
        // update = { position: room.position - 1 };
        // Categories.findOneAndUpdate(filter, update).exec();
        RoomsModel.findOneAndUpdate(
          { _id: room._id },
          { position: room.position - 1 }
        ).exec();
      }
    });
  } else {
    doc.forEach((room, n) => {
      if (
        room.position >= finalIndex &&
        room.position < draggingRoomIndex + 1
      ) {
        RoomsModel.findOneAndUpdate(
          { _id: room._id },
          { position: room.position + 1 }
        ).exec();
      }
    });
  }
  RoomsModel.findOneAndUpdate(
    { _id: roomId },
    { position: finalIndex + 1 }
  ).exec();

  res.send({ status: "done" });
});

router.post("/api/deleteCategory", (req, res) => {
  RoomsModel.find({ _id: req.body.deleteId }).remove().exec();
  res.send({ status: "deleted" });
  // also resort by position
});

router.post("/move", (req, res) => {
  // pass
});

router.delete("/remove", (req, res) => {
  // pass
});

module.exports = router;
