
const UserModel = require('../models/user.model');
const MessageModel = require('../models/message.model');

const mongoose = require('mongoose');

const addUser = ({ userName, password, hash }) => {
  let newUser = new UserModel({
    username: userName,
    password: password,
    hash: hash,
  });
  
  saveModel(newUser);
}

const addMessage = ({ message, user, category }) => {
  let data = "";

  let newMessage = new MessageModel({
    data: data,
    message: message,
    user: user,
    category: category,
  });
  
  saveModel(newMessage);
}

const removeMessage = (hash) => {
  // pass
}

const checkUser = (username) => {
  let user = UserModel.find({
    username: username
  })
  .then(doc => console.log(doc))
  .catch(err => console.error(err));

  console.log(user);
  return {}
}

const saveModel = (model) => {
  model
  .save()
  .then(doc => {
    // console.log(doc);
    // res.send({status: "successfullySaved"});
    }
  )
  .catch(err => console.error(err));
}

const registerUser = (username, password0, password1, res) => {
  UserModel.find({
    username: username
  })
  .then(doc => {
    if (password0 === password1 && doc.length === 0){
      let user = new UserModel({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        password: password0, // hash: buffer_data,
      });
  
      saveModel(user);
  
      return res.send({ data: "done"})
    }
    else
      return res.send({ data: "try again" });
  })
  .catch(err => console.log(err));
}

const addIp = (username, req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  UserModel.updateOne({
    username: username,
  },
  {
    $set: {
      ip: ip,
    }
  })
  .exec()
  .catch(err => console.log(err));
}

const removeIp = (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  UserModel.updateOne({
    ip: ip,
  },
  {
    $set: {
      ip: "",
    }
  })
  .exec()
  .then(doc => {
    res.send({ status: "done" });
  })
  .catch(err => console.error(err));
}

const checkIp = (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  UserModel.find({
    ip: ip
  })
  .then(doc => {
    if (doc.length !== 0){
      res.send({
        status: "1",
        username: doc[0].username,
        messages: "",
      });
    }
    else
      res.send({ status: "0" });
  })
  .catch(err => res.send({ status: "0" }));
}

const checkLogin = (username, password, req, res) => {
  UserModel.find({
    username: username
  })
  .exec()
  .then(doc => {
    let pswrd = String(doc[0].password);
    if (password === pswrd){
      addIp(username, req);
      return res.send({ data: doc[0].hash });
    }
    else {
      throw new Error("error");
    }
  })
  .catch(err => {
    console.log(err);
    return res.send({ data: "try again" })
  });
}

module.exports = { addUser, addMessage, removeMessage, checkUser, registerUser,
                  checkLogin, removeIp, checkIp,
                };