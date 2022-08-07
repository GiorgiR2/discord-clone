const MessageModel = require("../models/message.model");

const mongoose = require("mongoose");

const { saveModel } = require("./saveModel");

const addToMongoose = (data) => {
  // authentication, username, message, datetime, room
  // console.log("data", data);
  let newMessageModel;
  console.log("data to save: ", data);

  if (data.isFile)
    newMessageModel = new MessageModel({
      _id: new mongoose.Types.ObjectId(),
      user: data.username,
      isFile: true,
      originalName: data.originalName,
      path: data.path, // <----
      date: data.datetime, // <----
      room: data.room,
      roomId: data.roomId, // <----
    });
  else
    newMessageModel = new MessageModel({
      _id: new mongoose.Types.ObjectId(),
      isFile: false,
      user: data.username,
      message: data.message,
      date: data.datetime,
      room: data.room,
      roomId: data.roomId,
    });

  saveModel(newMessageModel);
};

const removeMessage = (hash) => {
  // pass
};

const loadMessages = (socket, room) => {
  MessageModel.find({
    room: room,
  })
    .exec()
    .then((doc) => {
      socket.emit("messagesData", doc);
    });
  //   console.log("msg", messages);
  //   return messages;
};

module.exports = { addToMongoose, removeMessage, loadMessages };
