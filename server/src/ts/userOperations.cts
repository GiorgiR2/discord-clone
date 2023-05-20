import { loadRooms, findLowestPositionRoom } from "./roomOperations.cjs";
import UserModel from "../models/user.model.cjs";
import saveModel from "./saveModel.cjs";

import mongoose from "mongoose";

import { connectedUsersT, checkDataI, checkLoginI } from "../types/types.cjs";

const sha1 = require("sha1");

const bufferData = (username: string, password: string): string => sha1(`${username}${password}`);

const registerUser = async (username: string, hashedPassword: string, ip: string | undefined): Promise<{ success: boolean, data?: "username exist" }> => {
  const users = await UserModel.find({ username });

  if (users.length === 0) {
    const user = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      username,
      password: hashedPassword,
      hashId: bufferData(username, hashedPassword),
      ip,
      status: "user",
    });

    saveModel(user);
    return { success: true };
  } else {
    return { success: false, data: "username exist" };
  }
};

const addIp = async (username: string, ip: string | undefined): Promise<void> => {
  await UserModel.findOneAndUpdate({ username }, { ip })
    .exec()
    .then(_ => console.log(`ip ${ip} added...`))
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
      rooms
    };
  } else return {
    success: false
  };
};

const checkLogin = async (username: string, password: string): Promise<checkLoginI> => {
  const user = await UserModel.findOne({ username }).exec();

  if (user == undefined) {
    return { success: false };
  } else {
    let pswrd = String(user.password);
    if (password === pswrd) {
      const hashId = user.hashId;
      const { _roomId } = await findLowestPositionRoom();
      return {
        success: true,
        roomId: _roomId,
        hashId
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

const getUserHash = async (username: string): Promise<{ userHash: string, userStatus: string }> =>
  new Promise((resolve, reject) => {
    UserModel.findOne({ username })
    .then(user => {
      resolve({ userHash: user!.hashId, userStatus: user!.status as string });
    })
    // reject({ userHash: null });
  });

export { registerUser, addIp, checkLogin, checkData, usersStatus, getUserHash };