import express, { Request, Response, Router } from "express";
import mongoose from "mongoose";

import RoomsModel, { roomsSchemaI } from "../models/rooms.model.cjs";
import saveModel from "../ts/saveModel.cjs";
import { findLowestPositionRoom } from "../ts/roomOperations.cjs";

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
  const room = await RoomsModel.findOne({ _id: id }).exec();
  const { _roomId } = await findLowestPositionRoom();

  if (!room){
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

router.post("/api/editCategory", async (req: Request, res: Response) => {
  const { catId, newCatName } = req.body;

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

router.post("/api/addCategory", async (req: Request, res: Response) => {
  RoomsModel.count({}, async (err: any, count: number) => {
    let newRoomModel = new RoomsModel({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      position: count + 1,
      voice: req.body.voice,
    });

    await saveModel(newRoomModel);
    await res.send({
      status: "done",
      _id: newRoomModel._id,
      position: newRoomModel.position,
    });
  });
});

router.post("/api/changeRoomPosition", async (req: Request, res: Response) => {
  const { roomId, draggingRoomIndex, finalIndex } = req.body;

  if (finalIndex === draggingRoomIndex) {
    return;
  }

  let filter = { _id: roomId };
  let update = { position: 1001 };
  console.log(`draggingRoomIndex: ${draggingRoomIndex}; finalIndex: ${finalIndex};`);
  await RoomsModel.findOneAndUpdate(filter, update).exec();

  RoomsModel.find().sort({ position: 1 }).exec()
    .then(doc => {
      if (finalIndex > draggingRoomIndex) {
        doc.forEach((room: roomsSchemaI, n: number) => {
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
        doc.forEach((room: roomsSchemaI, n: number): void => {
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
});

router.post("/api/deleteCategory", async (req: Request, res: Response) => {
  let doc = await RoomsModel.find({ _id: req.body.deleteId });
  let position = doc[0].position;

  console.log("position:", position);
  await doc[0].remove();
  res.send({ status: "deleted" });

  // renumber rooms (positions)
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