import UserModel from "../models/user.model.cjs";

import { loadRooms, findLowestPositionRoom } from "./roomOperations.cjs";
import saveModel from "./saveModel.cjs";

import mongoose from "mongoose";

var sha1 = require("sha1");

import { connectedUsersT, checkDataI, checkLoginI } from "../types/types.cjs";

const bufferData = (username: string, password: string): string => {
  let hash = sha1(`${username}${password}`);
  return hash;
};

const registerUser = async (username: string, hashedPassword: string, ip: string | undefined): Promise<"done" | "username already exist"> => {
  const doc = await UserModel.find({ username });

  if (doc.length === 0) {
    let user = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      username,
      password: hashedPassword,
      hashId: bufferData(username, hashedPassword),
      ip,
    });

    saveModel(user);
    return "done";
  } else {
    return "username already exist";
  }
};

const addIp = async (username: string, ip: string | undefined): Promise<void> => {
  await UserModel.updateOne({ username }, { $set: { ip } })
    .exec()
    .then(_ => console.log("ip added..."))
    .catch(err => console.error(err));
};

const checkData = async (hashId: string): Promise<checkDataI> => {
  const doc = await UserModel.find({ hashId }).exec();

  if (doc.length !== 0) {
    const rooms = await loadRooms();

    return {
      success: true,
      username: doc[0].username,
      authentication: doc[0].hashId,
      rooms,
    };
  } else return {
    success: false
  };
};

const checkLogin = async (username: string, password: string): Promise<checkLoginI> => {
  let doc = await UserModel.find({ username }).exec();

  if (doc[0] == undefined) {
    return { success: false };
  } else {
    let pswrd = String(doc[0].password);
    if (password === pswrd) {
      const hashId = doc[0].hashId;
      const { _roomId } = await findLowestPositionRoom();
      return {
        success: true,
        roomId: _roomId,
        hashId,
      };
    } else {
      return { success: false };
    }
  }
};

const usersStatus = async (): Promise<connectedUsersT> => {
  let users: connectedUsersT = {};

  await UserModel.find()
    .exec()
    .then((doc: any) => {
      doc.forEach((el: any) => {
        users[el.username] = {
          status: "offline",
          tabsOpen: 0,
          socketIds: []
        };
      });
    });

  return users;
};

export { registerUser, addIp, checkLogin, checkData, usersStatus };