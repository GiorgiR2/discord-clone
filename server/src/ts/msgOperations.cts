import MessageModel from "../models/message.model.cjs";

import mongoose from "mongoose";

import saveModel from "./saveModel.cjs";

import { addToMongooseDataI } from "../types/types.cjs";

const addToMongoose = (data: addToMongooseDataI ): string => {
  // authentication, username, message, datetime, room
  // console.log("data", data);
  let newMessageModel: any;
  // console.log("data to save: ", data);

  if (data.isFile){
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
    });
  }
  else{
    newMessageModel = new MessageModel({
      _id: new mongoose.Types.ObjectId(),
      isFile: false,
      user: data.username,
      message: data.message,
      date: data.datetime,
      room: data.room,
      roomId: data.roomId,
      emojis: [],//[{emoji: 2, num: 1}, {emoji: 1, num: 4}],
    });
  }

  saveModel(newMessageModel);

  return newMessageModel._id;
};

export { addToMongoose };