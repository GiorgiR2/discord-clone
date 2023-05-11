import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bp from "body-parser";

import { usersStatus } from "./ts/userOperations.cjs";
import { findLowestPositionRoom } from "./ts/roomOperations.cjs";
import * as msgOps from "./ts/msgOperations.cjs";

import MessageModel, { messageSchemaI } from "./models/message.model.cjs";
import RoomModel from "./models/rooms.model.cjs";
import UserModel, { userSchemaI } from "./models/user.model.cjs";

import { authenticationI, connectedUsersT, popOutI, usersInVoiceI } from "./types/types.cjs";
import { attachEmojiI, deleteMessageI, editMessageI, fileI, joinI, messageIS } from "./types/sockets.js";

import "./config/db.cjs";
import dotenv from "dotenv";
import { disconnectUser, emitDisconnect, popOut } from "./scripts/disconnectUser.cjs";
import { joinUser, sendInitMessages } from "./scripts/joinUser.cjs";

const usersRouter = require("./routes/users.cjs");
const messagesRouter = require("./routes/messages.cjs");
const roomsRouter = require("./routes/rooms.cjs");

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

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

const main = (connectedUsers: connectedUsersT) => {
  io.on("connection", (socket: any) => {
    let username: string;
    let room: string;
    console.log("new connection", socket.id);

    socket.on("join", async (data: joinI) => {
      let { roomId, _username } = data;
      let roomM = await RoomModel.findOne({ _id: roomId }).exec();
      if (!roomM) {
        const { _name, _roomId } = await findLowestPositionRoom();
        room = _name;
        roomId = _roomId;
      }
      else {
        room = roomM.name;
      }

      if (roomM && roomM.voice) {
        socket.emit("roomName", { name: room, roomId: roomId, voice: true });
      }
      else {
        const { messages } = await sendInitMessages(room);
        socket.emit("roomName", { name: room, roomId: roomId, voice: false });
        socket.emit("messages", messages);
      }

      username = _username;
      joinUser(socket, connectedUsers, username, room);
      console.log(`== joined ${username} ${socket.id}`);
    });

    socket.on("disconnect", () => {
      disconnectUser(socket, connectedUsers, username);
      emitDisconnect(socket, io, roomIds, usersInVoice);
      popOut(socketIds, usersInVoice, roomIds, socket.id);

      console.log(`== disconnect ${username} ${socket.id}`);
      Object.keys(connectedUsers).forEach((usr: string) => {
        if (connectedUsers[usr].tabsOpen > 0) {
          console.log(connectedUsers[usr]);
        }
      });
    });

    socket.on("popAccount", (data: popOutI) => {
      console.log("deleting user", data.username);
      delete connectedUsers[data.username];
      console.log("user:", data.username);
    }
    );

    socket.on("message", async (data: messageIS) => {
      const { authentication, username, message, datetime, room } = data;

      let _id = msgOps.addToMongoose({ ...data, isFile: false });

      let sdata = {
        _id,
        message,
        user: username,
        date: datetime,
        isFile: false,
        edited: false,
      };
      socket.emit("message", sdata);
      socket.in(room).emit("message", sdata);
      // console.log("sent (1)", room, message, "from", username);
    });

    socket.on("deleteMessage", async (data: deleteMessageI & authenticationI): Promise<void> => {
      const { messageId, username, hash } = data;
      const message: any = await MessageModel.findOne({ _id: messageId });
      const user: any = await UserModel.findOne({ username });
      if ((message.user === username && user.hashId === hash) || (user.hashId === hash && user.status === "Admin")){
        message.remove();
        socket.in(data.room).emit("messageDeleted", {success: true, _id: messageId });
        socket.emit("messageDeleted", { success: true, _id: messageId });
      }
      else {
        socket.emit("messageDeleted", { success: false, status: "You do not have privileges to delete that message..."  });
      }
    });

    socket.on("editMessage", async (data: editMessageI) => {
      const { _id } = data;
      let filter = { _id };
      let msg = data.messageHTML
        .replace("</div><div>", "<br>")
        .replace("<div>", "")
        .replace("</div>", "<br>");
      console.log(`%cmsg: ${msg}`, "color: red");
      // msg = msg.substring(0, msg.length - 4);
      msg = replaceAll(msg, "<br>", "\n");

      let update = { message: msg, edited: true };
      MessageModel.findOneAndUpdate(filter, update).exec();
    });

    socket.on("file", async (data: fileI) => {
      //const authentication, user, datetime, roomId, size, filename;
      const { _id, room } = data;

      await MessageModel.findById(_id).then(
        (doc: any) => {
          socket.emit("message", doc);
          socket.in(room).emit("message", doc);
          console.log("file sent:", doc._id, doc.originalName);
        }
      );
    });

    socket.on("attachEmoji", async (data: attachEmojiI) => {
      const { _id, emoji, user } = data;
      console.log("server received emoji:", emoji, _id, user);
      let message: any = await MessageModel.findOne({ _id });

      let found = false;
      let suspend = false;
      let num = 1;
      message.emojis.forEach((_emoji: any) => {
        if (_emoji.emoji === emoji) {
          if (_emoji.users.includes(user) === false) {
            _emoji.num += 1;
            _emoji.users.push(user);
            found = true;
            num = _emoji.num;
          } else {
            suspend = true;
          }
        }
      });
      if (suspend) {
        return;
      } else if (found === false) {
        message.emojis.push({ emoji, num: 1, users: [user] });
      }

      let jData = { emoji, num, _id };
      socket.emit("newEmoji", jData);
      socket.in(data.room).emit("newEmoji", jData);
      await message.save();
    });

    // #################################
    // #      WebRTC Signalling        #
    // #################################

    socket.on("joinVoice", (data: any) => {
      if (data.username === "") {
        // console.log("no username !!!!!!!!!!!");
        return;
      }
      const { room, roomId, username } = data;

      let payload = {
        id: socket.id,
        username: username,
      };
      if (usersInVoice[roomId] === undefined) {
        usersInVoice[roomId] = [];
      }
      // console.log("socketIds:", socketIds);
      // console.log("includes", socketIds.includes(socket.id));
      if (!socketIds.includes(socket.id)) {
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

  app.use(bp.json());
  app.use(bp.urlencoded({ extended: true }));
  app.use(cors(corsOptions));
  app.use(usersRouter);
  app.use(messagesRouter);
  app.use(roomsRouter);
};

// next two functions are taken out of stackoverflow
const escapeRegExp = (arg: string): string => {
  return arg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

const replaceAll = (str: string, match: string, replacement: string): string => {
  return str.replace(new RegExp(escapeRegExp(match), "g"), () => replacement);
};

(async () => {
  var connectedUsers: connectedUsersT = await usersStatus();
  console.log(connectedUsers);

  main(connectedUsers);
})();
