import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const usersRouter = require("./routes/users.cjs");
const messagesRouter = require("./routes/messages.cjs");
const roomsRouter = require("./routes/rooms.cjs");

import { usersStatus } from "./ts/userOperations.cjs";
import { loadMessages, addToMongoose } from "./ts/msgOperations.cjs";
// import catOps from "./ts/catOperations.cjs";

import MessageModel from "./models/message.model.cjs";

import "./mongooseAPI.cjs";

// types
import { connectedUsersI, usersInVoiceI } from "./types/types.cjs";

import dotenv from "dotenv";
dotenv.config(); // .env variables

const PORT = process.env.PORT || 5000;

const app: express.Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origins: "*:*",
    credentials: true,
    // optionSuccessStatus: 200,
  },
});

var usersInVoice: usersInVoiceI = {};
var socketIds: string[] = [];
var roomIds: string[] = [];

const main = (connectedUsers: connectedUsersI[]) => {
  io.on("connection", (socket: any) => {
    let username: string;
    console.log("new connection", socket.id);

    socket.on("join", (data: any) => {
      console.log("join", data);
      username = data.username;

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
          let userData: connectedUsersI = connectedUsers[i];
          if (userData.username == data.username) {
            if (userData.tabsOpen === 0) {
              userData.status = "online";

              socket.broadcast.emit("online", {
                username: username,
              });
              userData.tabsOpen = 1;
            } else userData.tabsOpen += 1;
            break;
          }
        }

      socket.emit("status", connectedUsers);

      loadMessages(socket, data.room);

      socket.join(data.room);
    });

    socket.on("disconnect", (data: any) => {
      for (var i in connectedUsers) {
        let userData: connectedUsersI = connectedUsers[i];
        if (userData.username === username) {
          userData.tabsOpen -= 1;
          if (userData.tabsOpen === 0) {
            socket.broadcast.emit("offline", {
              username: username,
            });
            userData.status = "offline";
          }
          break;
        }
      }

      console.log("disconnect", username, socket.id);
      // emit disconnect message for voice chat users
      roomIds.forEach((roomid) => {
        usersInVoice[roomid].forEach((user) => {
          if (user.id === socket.id) {
            usersInVoice[roomid].forEach((user0) => {
              if (user0.id !== socket.id) {
                console.log("'peerDisconnected' emitted...");
                io.to(user0.id).emit("peerDisconnected", { id: socket.id });
              }
            });
          }
        });
      });

      // Todo: implement new code to pip out disconnected users
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

    socket.on("message", async (data: any) => {
      let authentication: string = data.authentication;

      let user: string = data.username;
      let message: string = data.message;

      let datetime: string = data.datetime;
      let room: string = data.room;

      let _id = addToMongoose({ ...data, isFile: false }); // authentication, username, message, datetime, room

      let sdata = {
        user: user,
        message: message,
        date: datetime,
        isFile: false,
        _id: _id,
        edited: false
      };
      socket.emit("M_S_O", sdata);
      socket.in(room).emit("M_S_O", sdata);
      // console.log("sent (1)", room, message, "from", username);
    });

    socket.on("deleteMessage", async (data: any): Promise<void> => {
      MessageModel.find({ _id: data._id }).remove().exec();
      socket.in(data.room).emit("messageDeleted", { _id: data._id });
    });

    socket.on("editMessage", async (data: any) => {
      let filter = { _id: data._id };
      let msg = data.messageHTML
        .replace("</div><div>", "<br>")
        .replace("<div>", "")
        .replace("</div>", "<br>");
      console.log(`%cmsg: ${msg}`, 'color: red');
      // msg = msg.substring(0, msg.length - 4);
      msg = replaceAll(msg, "<br>", "\n");

      let update = { message: msg, edited: true };
      MessageModel.findOneAndUpdate(filter, update).exec();
    });

    socket.on("file", async (data: any) => {
      let authentication = data.authentication;

      let user: string = data.user;
      let datetime: string = data.datetime;
      let room: string = data.room;
      let roomId: string = data.roomId;
      let size: string = data.size;
      let filename: string = data.filename;

      MessageModel.findOne({ size: size, originalName: filename }).then((doc: any) => {
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

    socket.on("joinVoice", (data: any) => {
      if (data.username === "") {
        // console.log("no username !!!!!!!!!!!");
        return;
      }
      let room: string = data.room;
      let roomId: string = data.roomId;
      let username: string = data.username;
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

    socket.on("offer", (data: any) => {
      // {id, text, roomId}
      console.log(`* offer generated by: ${socket.id}; for: ${data.id}`);
      io.to(data.id).emit("offer", {
        text: data.text,
        to: data.id,
        from: socket.id,
      });
    });

    socket.on("candidate", (data: any) => {
      console.log(
        `* ice candidates generated by: ${socket.id}; for: ${data.id}`
      );
      io.to(data.id).emit("candidate", {
        text: data.text,
        to: data.id,
        from: socket.id,
      });
    });

    socket.on("answer", (data: any) => {
      console.log(`* answer generated by: ${socket.id}; for: ${data.to}`);
      io.to(data.to).emit("answer", {
        text: data.text,
        to: data.id,
        from: socket.id,
      });
    });

    socket.on("toggleVideo", (data: any) => {
      // console.log(`users in ${data.roomId}: ${usersInVoice[data.roomId]}`);
      usersInVoice[data.roomId].forEach((user) => {
        if (user.id !== socket.id) {
          io.to(user.id).emit("changeStatus", {
            id: socket.id,
            status: data.status,
          });
        }
      });
    });

    // socket.on("toggleAudio", (data) => {
      // console.log(`users in ${data.roomId}: ${usersInVoice[data.roomId]}`);
    // });
  });

  server.listen(PORT, () => console.log(`Server is on PORT: ${PORT}`));

  app.use(cors(corsOptions));
  app.use(usersRouter);
  app.use(messagesRouter);
  app.use(roomsRouter);
};

// next two functions are taken out of stackoverflow
const escapeRegExp = (arg: string): string => {
  return arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const replaceAll = (str: string, match: string, replacement: string): string => {
   return str.replace(new RegExp(escapeRegExp(match), 'g'), ()=>replacement);
}

(async () => {
  const connectedUsers: connectedUsersI[] = await usersStatus();
  main(connectedUsers);
})();
