import RoomModel from "../models/rooms.model.cjs";

import { voiceI, loadRoomsI } from "../types/types.cjs";

const loadRooms = async (): Promise<loadRoomsI[]> => RoomModel.find().sort({ position: 1 }).exec();

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