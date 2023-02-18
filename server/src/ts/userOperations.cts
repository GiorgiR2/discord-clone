import UserModel from "../models/user.model.cjs";

import { loadCats } from "../ts/catOperations.cjs";
import saveModel from "./saveModel.cjs";

import mongoose from "mongoose";

var sha1 = require("sha1");

import { connectedUsersI, checkIpI, checkDataI, checkLoginI } from "../types/types.cjs";

// const checkUser = (username: string) => {
//   let user = UserModel.find({
//     username: username,
//   })
//     .then((doc: any) => console.log(doc))
//     .catch((err: string) => console.error(err));

//   console.log(user);
//   return {};
// };

const bufferData = (username: string, password: string): string => {
  let hash = sha1(`${username}${password}`);
  return hash;
};

const registerUser = async (username: string, hashedPassword: string, ip: string | undefined): Promise<"done" | "username already exists"> => {
  const doc = await UserModel.find({
    username: username,
  });

  if (doc.length === 0) {
    let user = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      username: username,
      password: hashedPassword,
      hashId: bufferData(username, hashedPassword),
      ip: ip,
    });

    saveModel(user);
    return "done";
  } else{
    return "username already exists";
  }
};

const addIp = async (username: string, ip: string | undefined): Promise<void> => {
  await UserModel.updateOne(
    {
      username: username,
    },
    {
      $set: {
        ip: ip,
      },
    }
  )
    .exec()
    .then((_: any) => console.log("ip added..."))
    .catch((err: any) => console.error(err));
};

const removeIp = async (ip: string | undefined): Promise<string> => {
  await UserModel.updateOne(
    {
      ip: ip,
    },
    {
      $set: {
        ip: "",
      },
    }
  );
  return "done";
};

const checkIp = async (ip: string): Promise<checkIpI> => {
  console.log("checking ip...", ip);
  const doc = await UserModel.find({
    ip: ip,
  }).exec();

  if (doc.length !== 0) {
    let cats = await loadCats();

    return {
      status: "1",
      username: doc[0].username,
      categories: cats,
      authentication: doc[0]._id.toString(),
    };
  } else return { status: "0" };
};

const checkData = async (hashId: string): Promise<checkDataI> => {
  // console.log("checking id...", hashId);
  const doc = await UserModel.find({
    hashId: hashId,
  }).exec();

  if (doc.length !== 0) {
    let cats = await loadCats();

    return {
      status: "success",
      username: doc[0].username,
      categories: cats,
      authentication: doc[0]._id.toString(),
    };
  } else return { status: "0" };
};

const checkLogin = async (username: string, password: string): Promise<checkLoginI> => {
  let doc = await UserModel.find({
    username: username,
  }).exec();

  // console.log("\n checking \n");
  if (doc[0] == undefined) {
    return { status: "try again" };
  } else {
    let pswrd = String(doc[0].password);
    //console.log(pswrd === password);
    if (password === pswrd) {
      let hash = doc[0].hashId;
      // console.log("hashId:", doc[0]);
      return {
        status: "done",
        roomId: "61ed960432479c682956838e",
        hashId: hash,
      };
    } else {
      return { status: "try again" };
    }
  }
};

const usersStatus = async (): Promise<connectedUsersI[]> => {
  let users: connectedUsersI[] = [];

  await UserModel.find()
    .exec()
    .then((doc: any) => {
      doc.forEach((el: any) => {
        users.push({
          username: el.username,
          status: "offline",
          tabsOpen: 0,
        });
      });
    });

  return users;
};

// module.exports = {
//   checkUser,
//   registerUser,
//   addIp,
//   checkLogin,
//   removeIp,
//   checkIp,
//   checkData,
//   usersStatus,
// };
export { registerUser, addIp, checkLogin, removeIp, checkIp, checkData, usersStatus };