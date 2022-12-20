const UserModel = require("../models/user.model");

const catOps = require("../js/catOperations");
const { saveModel } = require("./saveModel");

const mongoose = require("mongoose");

var sha1 = require("sha1");

const checkUser = (username) => {
  let user = UserModel.find({
    username: username,
  })
    .then((doc) => console.log(doc))
    .catch((err) => console.error(err));

  console.log(user);
  return {};
};

const bufferData = (username, password) => {
  let hash = sha1(`${username}${password}`);
  return hash;
};

const registerUser = async (username, password0, password1, res) => {
  const doc = await UserModel.find({
    username: username,
  });

  if (password0 === password1 && doc.length === 0) {
    let user = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      username: username,
      password: password0,
      hashId: bufferData(username, password0),
      ip: "",
    });

    saveModel(user);

    return "done";
  } else return "try again";
};

const addIp = async (username, ip) => {
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
    .then((_) => console.log("ip added..."))
    .catch((err) => console.log(err));
};

const removeIp = async (ip) => {
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

const checkIp = async (ip) => {
  console.log("checking ip...", ip);
  const doc = await UserModel.find({
    ip: ip,
  }).exec();

  if (doc.length !== 0) {
    let cats = await catOps.loadCats();

    return {
      status: "1",
      username: doc[0].username,
      categories: cats,
      authentication: doc[0]._id,
    };
  } else return { status: "0" };
};

const checkData = async (hashId) => {
  // console.log("checking id...", hashId);
  const doc = await UserModel.find({
    hashId: hashId,
  }).exec();

  if (doc.length !== 0) {
    let cats = await catOps.loadCats();

    return {
      status: "success",
      username: doc[0].username,
      categories: cats,
      authentication: doc[0]._id,
    };
  } else return { status: "0" };
};

const checkLogin = async (username, password) => {
  let doc = await UserModel.find({
    username: username,
  }).exec();

  // console.log("\n checking \n");
  if (doc[0] == undefined) {
    return "try again";
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
      return "try again";
    }
  }
};

const usersStatus = async () => {
  let users = [];

  await UserModel.find()
    .exec()
    .then((doc) => {
      doc.forEach((el) => {
        users.push({
          username: el.username,
          status: "offline",
          tabsOpen: 0,
        });
      });
    });

  return users;
};

module.exports = {
  checkUser,
  registerUser,
  addIp,
  checkLogin,
  removeIp,
  checkIp,
  checkData,
  usersStatus,
};
