import RoomModel from "../models/rooms.model.cjs";

import { voiceI, loadRoomsI } from "../types/types.cjs";

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

const loadRooms = async (): Promise<loadRoomsI[]> => {
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

  let rooms: Promise<loadRoomsI[]> = RoomModel.find().sort({ position: 1 }).exec();
  return rooms;
};

const getVoiceRooms = async (): Promise<voiceI> => {
  let voices: voiceI = {};

  await RoomModel.find({ voice: true })
    .exec()
    .then((doc: any) => {
      doc.map((el: any) => {
        voices[el._id] = []; // roomName: [socket.id, ice-candidate]
      });
    });

  return voices;
};

const findLowestPositionRoom = (): Promise<{ _roomId: string, _name: string }> =>
  new Promise((resolve, reject) => {
    RoomModel.find({})
      .sort({ position: 1 })
      .limit(1)
      .exec()
      .then((res: any) => {
        if (res.length !== 0) {
          resolve({ _roomId: res[0]._id, _name: res[0].name });
        }
      });
  });

export { loadRooms, getVoiceRooms, findLowestPositionRoom };