import RoomsModel from "../models/rooms.model.cjs";
import saveModel from "./saveModel.cjs";

import mongoose from "mongoose";

import { voiceI, loadCatsI } from "../types/types.cjs";

// const addCats = (name: string, voiceBool: boolean): void => {
//   let position = RoomsModel.findAll().length + 1;

//   const newCat = new RoomsModel({
//     _id: new mongoose.Types.ObjectId(),
//     name: name,
//     position: position,
//     voice: voiceBool,
//   });

//   saveModel(newCat);
// };

const loadCats = async (): Promise<loadCatsI[]> => {
  // addCats(`room 1`, 1);
  // addCats(`room 2`, 2);
  // addCats(`room 3`, 3);
  // addCats(`room 4`, 4);
  // addCats(`room 5`, 5);
  // addCats(`room 6`, 6);
  // addCats(`room 7`, 7);
  // addCats(`voice 1`, 8);
  // addCats(`voice 2`, 9);
  // addCats(`voice 3`, 10);

  let rooms: Promise<loadCatsI[]> = RoomsModel.find().sort({ position: 1 }).exec();
  return rooms;
};

const getVoiceRooms = async (): Promise<voiceI> => {
  let voices: voiceI = {};

  await RoomsModel.find({ voice: true })
    .exec()
    .then((doc: any) => {
      doc.map((el: any) => {
        voices[el._id] = []; // roomName: [socket.id, ice-candidate]
      });
    });

  return voices;
};

// module.exports = {
//   loadCats,
//   getVoiceRooms,
// };
export { loadCats, getVoiceRooms };