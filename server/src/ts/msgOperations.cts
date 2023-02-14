import MessageModel, { messageSchemaI } from "../models/message.model.cjs";

import mongoose from "mongoose";

import saveModel from "./saveModel.cjs";

import { addToMongooseDataI } from "../types/types.cjs";

let num: number = 0;

// find the maximum value
MessageModel.find({})
.sort({ number: -1 })
.limit(1)
.exec()
.then((res: messageSchemaI[]) => {
  // console.log("res:", res);
  if (res.length !== 0){
    num = res[0].number+1;
  }
});

const addToMongoose = (data: addToMongooseDataI): string => {
  let newMessageModel: any;

  if (data.isFile) {
    newMessageModel = new MessageModel({
      _id: new mongoose.Types.ObjectId(),
      user: data.username,
      isFile: true,
      originalName: data.originalName,
      path: data.path, // <----
      date: data.datetime, // <----
      room: data.room,
      roomId: data.roomId, // <----
      downloadCount: 0,
      size: data.size,
      emojis: [],//[{emoji: 2, num: 1}, {emoji: 1, num: 4}],
      number: num,
    });
  }
  else {
    newMessageModel = new MessageModel({
      _id: new mongoose.Types.ObjectId(),
      isFile: false,
      user: data.username,
      message: data.message,
      date: data.datetime,
      room: data.room,
      roomId: data.roomId,
      emojis: [],//[{emoji: 2, num: 1}, {emoji: 1, num: 4}],
      number: num,
    });
  }
  num++;

  saveModel(newMessageModel);

  return newMessageModel._id;
};

export { addToMongoose };