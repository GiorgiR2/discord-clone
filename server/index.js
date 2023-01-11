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

var usersInVoice = {};
var socketIds = [];
var roomIds = [];

(async () => {
  const connectedUsers = await userOps.usersStatus();
  // const usersInVoice = await catOps.getVoiceRooms();
  // console.log("usersInVoice:", usersInVoice);
  main(connectedUsers);
})();

const main = (connectedUsers) => {
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

      console.log("disconnect", userNN, socket.id);
      // let roomId;
      socketIds = socketIds.filter((id, n) => {
        if (id !== socket.id) {
          return id;
        } else {
          usersInVoice[roomIds[n]] = usersInVoice[roomIds[n]].filter(
            (el) => el.id !== socket.id
          );
          roomIds = roomIds.filter((r, n0) => n0 !== n);
        }
      });
    });

    socket.on("message", async (data, callback) => {
      let authentication = data.authentication;

      let user = data.username;
      let message = data.message;

      let datetime = data.datetime;
      let room = data.room;

      let _id = msgOps.addToMongoose({ ...data, isFile: false }); // authentication, username, message, datetime, room

      let sdata = {
        user: user,
        message: message,
        date: datetime,
        isFile: false,
        _id: _id,
      };
      socket.emit("M_S_O", sdata);
      socket.in(room).emit("M_S_O", sdata);
      // console.log("sent (1)", room, message, "from", userNN);
    });

    socket.on("deleteMessage", async (data) => {
      Message.find({ _id: data._id }).remove().exec();
      socket.in(data.room).emit("messageDeleted", { _id: data._id });
    });

    socket.on("file", async (data) => {
      let authentication = data.authentication;

      let user = data.user;
      let datetime = data.datetime;
      let room = data.room;
      let roomId = data.roomId;
      let size = data.size;
      let filename = data.filename;

      Message.findOne({ size: size, originalName: filename }).then((doc) => {
        // let sdata = {
        //   user: user,
        //   _id: file._id,
        //   date: datetime,
        //   isFile: true,
        // };
        socket.emit("M_S_O", doc);
        socket.in(room).emit("M_S_O", doc);
        console.log("file sent:", doc._id, filename);
      });
    });

    // #################################
    // #      WebRTC Signalling        #
    // #################################

    socket.on("joinVoice", (data, callback) => {
      if (data.username === "") {
        console.log("no username !!!!!!!!!!!");
        return;
      }
      let room = data.room;
      let roomId = data.roomId;
      let username = data.username;
      let payload = {
        id: socket.id,
        username: username,
      };
      if (usersInVoice[roomId] === undefined) {
        // console.log("undefined");
        usersInVoice[roomId] = [];
      }
      // console.log("socketIds:", socketIds);
      // console.log("includes", socketIds.includes(socket.id));
      if (!socketIds.includes(socket.id)) {
        console.log("not includes");
        usersInVoice[roomId].push(payload);
        console.log(`
      ##########################################################
      #            UsersN: ${usersInVoice[roomId].length}  ${" ".repeat(33)}#
      #            New user connected: ${socket.id} ${" ".repeat(3)}#
      #            RoomID: ${roomId}            #
      #            Room: ${room}                    ${" ".repeat(11)}#
      ##########################################################\n`);
      }

      if (socketIds.includes(socket.id) === false) {
        // console.log("sent 0");
        socketIds.push(socket.id);
        roomIds.push(roomId);
        if (usersInVoice[roomId].length > 1) {
          usersInVoice[roomId].forEach((user) => {
            // console.log("sent 1");
            if (socket.id !== user.id) {
              // console.log("sent to", user.id);
              setTimeout(() => {
                io.to(user.id).emit("joined", {
                  to: user.id,
                  from: socket.id,
                  username: data.username,
                });
              }, 1000);
            }
          });
        }
      }
    });

    socket.on("offer", (data) => {
      // {id, text, roomId}
      console.log(`* offer generated by: ${socket.id}; for: ${data.id}`);
      io.to(data.id).emit("offer", {
        text: data.text,
        to: data.id,
        from: socket.id,
      });
    });

    socket.on("candidate", (data) => {
      console.log(
        `* ice candidates generated by: ${socket.id}; for: ${data.id}`
      );
      io.to(data.id).emit("candidate", {
        text: data.text,
        to: data.id,
        from: socket.id,
      });
    });

    socket.on("answer", (data) => {
      console.log(`* answer generated by: ${socket.id}; for: ${data.to}`);
      io.to(data.to).emit("answer", {
        text: data.text,
        to: data.id,
        from: socket.id,
      });
    });

    socket.on("toggleMic", (data) => {
      //pass
    });

    socket.on("toggleCam", (data) => {
      //pass
    });
  });

  server.listen(PORT, () => console.log(`Server is on PORT: ${PORT}`));

  app.use(cors(corsOptions));
  app.use(usersRouter);
  app.use(messagesRouter);
  app.use(categoriesRouter);
};
