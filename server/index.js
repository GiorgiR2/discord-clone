const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const usersRouter = require("./routes/users.js");
const messagesRouter = require("./routes/messages.js");
const categoriesRouter = require("./routes/categories.js");

const userOps = require("./js/userOperations");
const msgOps = require("./js/msgOperations");
const catOps = require("./js/catOperations");

const Message = require("./models/message.model");

require("./mongooseAPI.js");

require("dotenv").config(); // variables

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origins: "*:*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
    //     origin: [
    //         "http://localhost:3000",
    //         "http://192.168.100.8:3000",
    //         "https://admin.socket.io/",
    //     ]
  },
});

(async () => {
  const connectedUsers = await userOps.usersStatus();
  const usersInVoice = await catOps.getVoiceRooms();
  main(connectedUsers, usersInVoice);
})();

const main = (connectedUsers, usersInVoice) => {
  io.on("connection", (socket) => {
    let userNN;
    console.log("new connection", socket.id);

    socket.on("join", (data, callback) => {
      console.log("join", data);
      userNN = data.username;

      const newAccount = connectedUsers
        .map((data) => data.username)
        .includes(data.username);

      if (!newAccount)
        connectedUsers.push({
          username: data.username,
          status: "online",
          tabsOpen: 1,
        });
      else
        for (var i in connectedUsers) {
          let userData = connectedUsers[i];
          if (userData.username == data.username) {
            if (userData.tabsOpen === 0) {
              userData.status = "online";

              socket.broadcast.emit("online", {
                username: userNN,
              });
              userData.tabsOpen = 1;
            } else userData.tabsOpen += 1;
            break;
          }
        }

      socket.emit("status", connectedUsers);

      msgOps.loadMessages(socket, data.room);

      socket.join(data.room);
    });

    socket.on("disconnect", (data, callback) => {
      for (var i in connectedUsers) {
        let userData = connectedUsers[i];
        if (userData.username == userNN) {
          userData.tabsOpen -= 1;
          if (userData.tabsOpen === 0) {
            socket.broadcast.emit("offline", {
              username: userNN,
            });
            userData.status = "offline";
          }
          break;
        }
      }

      console.log("disconnect", userNN, socket.id); // automatically leaves the room
    });

    socket.on("message", async (data, callback) => {
      let authentication = data.authentication;

      let user = data.username;
      let message = data.message;

      let datetime = data.datetime;
      let room = data.room;

      let sdata = {
        user: user,
        message: message,
        date: datetime,
        isFile: false,
      };

      msgOps.addToMongoose({ ...data, isFile: false }); // authentication, username, message, datetime, room
      socket.emit("M_S_O", sdata);
      socket.in(room).emit("M_S_O", sdata);
      // console.log("sent (1)", room, message, "from", userNN);
    });

    socket.on("file", async (data) => {
      let authentication = data.authentication;

      let user = data.user;
      let datetime = data.datetime;
      let room = data.room;
      let roomId = data.roomId;
      let size = data.size;
      let filename = data.filename;

      Message.findOne({ size: size, originalName: filename }).then((file) => {
        let sdata = {
          user: user,
          _id: file._id,
          date: datetime,
          isFile: true,
        };
        socket.emit("M_S_O", sdata);
        socket.in(room).emit("M_S_O", sdata);
        console.log("file sent:", file._id, filename);
      });
    });

    // voice

    socket.on("join voice", (data, callback) => {
      let room = data.roomId;
      let payload = {
        id: socket.id,
        username: data.username,
      };

      if (usersInVoice[room]) usersInVoice[room].push(payload);
      else usersInVoice[room] = [payload];

      // element[0] === id
      const otherUsers = usersInVoice[room].filter(
        (element) => element.id !== id
      );
      if (otherUsers) {
        // send data to user just connected
        socket.emit("users online", otherUsers); // [[socket.id, userName], [], []]

        // send new user data to all others
        otherUsers.forEach((user) => {
          socket.to(user).emit("user joined", payload);
        });
      }
    });

    // signaling webRTC

    // socket.on('join voice', (data, callback) => { // { roomId }
    //     let id = socket.id;
    //     let room = data.room;
    //     let iceCandidate = data.iceCandidate;

    //     let payload = {
    //         id: id,
    //         iceCandidate: iceCandidate,
    //     }

    //     if (usersInVoice[room])
    //         usersInVoice[room].push(payload);
    //     else
    //         usersInVoice[room] = [payload];

    //     // element[0] === id
    //     const otherUsers = usersInVoice[room].filter(element => element.id !== id);
    //     if (otherUsers) {
    //         // send data to user just connected
    //         socket.emit("users online", otherUsers); // [[socket.id, ice-candidate], [], []]

    //         // send new user data to all others
    //         otherUsers.forEach(user => {
    //             socket.to(user).emit("user joined", payload);
    //         });
    //     }
    // });
  });

  server.listen(PORT, () => console.log(`Server is on PORT: ${PORT}`));

  app.use(cors(corsOptions));
  app.use(usersRouter);
  app.use(messagesRouter);
  app.use(categoriesRouter);
};
