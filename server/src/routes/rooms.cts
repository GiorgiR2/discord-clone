import express, { Request, Response, Router } from "express";
import mongoose from "mongoose";

import RoomsModel, { roomsSchemaI } from "../models/rooms.model.cjs";
import saveModel from "../ts/saveModel.cjs";
import { findLowestPositionRoom } from "../ts/roomOperations.cjs";
import { isAdmin, isAuth } from "./middleware/authentication.cjs";

const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Handling GET requests to /users...",
  });
});

router.get("/api/firstRoomId/", async (req: Request, res: Response) => {
  const { _roomId } = await findLowestPositionRoom();
  await res.send({ newRoomId: _roomId });
});

router.get("/api/roomId/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { _roomId } = await findLowestPositionRoom();
  const room = await RoomsModel.findOne({ _id: id }).exec();

  if (!room) {
    await res.send({ sucess: false, newRoomId: _roomId });
    return;
  }

  await res.send({
    sucess: true,
    name: room.name,
    voice: room.voice,
  });
  console.log("sent nameById:", room.name);
});

router.post("/api/editRoom", isAuth, async (req: Request, res: Response) => {
  const { _id, newName } = req.body;

  RoomsModel.findOneAndUpdate({ _id }, { name: newName }).exec();
  res.send({ success: true });
});

router.post("/api/addRoom", isAuth, async (req: Request, res: Response) => {
  const { name, voice } = req.body;
  RoomsModel.count({}, async (err: any, count: number) => {
    let newRoomModel = new RoomsModel({
      _id: new mongoose.Types.ObjectId(),
      name,
      position: count,
      voice,
    });

    await saveModel(newRoomModel);
    await res.send({
      success: true,
      _id: newRoomModel._id,
      position: newRoomModel.position,
    });
  });
});

router.post("/api/changeRoomPosition", isAuth, async (req: Request, res: Response) => {
  const { roomId, draggingRoomIndex, finalIndex } = req.body;

  if (finalIndex === draggingRoomIndex) {
    res.send({ success: false });
    return;
  }

  console.log(`draggingRoomIndex: ${draggingRoomIndex}; finalIndex: ${finalIndex};`);

  const messages = await RoomsModel.find().sort({ position: 1 });
  if (finalIndex > draggingRoomIndex) {
    messages.forEach((room: roomsSchemaI, n: number) => {
      if (n > draggingRoomIndex && n <= finalIndex) {
        // console.log("rise", room.name);
        RoomsModel.findOneAndUpdate({ _id: room._id }, { position: n - 1 }).exec();
      }
    });
  } else {
    messages.forEach((room: roomsSchemaI, n: number): void => {
      if (n < draggingRoomIndex && n >= finalIndex) {
        // console.log("rise", room.name);
        RoomsModel.findOneAndUpdate({ _id: room._id }, { position: n + 1 }).exec();
      }
    });
  }

  RoomsModel.findOneAndUpdate({ _id: roomId }, { position: finalIndex }).exec();

  res.send({ success: true });
});

router.post("/api/deleteRoom", isAdmin, async (req: Request, res: Response) => {
  const { _id } = req.body;

  const doc = await RoomsModel.findOne({ _id });

  if (doc === null) {
    return;
  }

  await doc.remove();
  res.send({ success: true });

  // renumber rooms (positions)
  const position = doc.position;
  RoomsModel.find().sort({ position: 1 }).exec()
    .then(rooms => {
      rooms.forEach((room: roomsSchemaI, n: number) => {
        if (room.position > position) {
          RoomsModel.findOneAndUpdate(
            { _id: room._id },
            { position: room.position - 1 }
          ).exec();
        }
      });
    });
});

module.exports = router;
// export default router;