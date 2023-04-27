import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { usersStatus } from "./ts/userOperations.cjs";
import * as msgOps from "./ts/msgOperations.cjs";

import MessageModel from "./models/message.model.cjs";

import { connectedUsersT, popOutI, usersInVoiceI } from "./types/types.cjs";
import {
  attachEmojiI,
  deleteMessageI,
  editMessageI,
  fileI,
  joinI,
  messageIS,
} from "./types/sockets.js";

import "./mongooseAPI.cjs";
import dotenv from "dotenv";
import { disconnectUser, emitDisconnect, popOut } from "./scripts/disconnectUser.cjs";
import { join } from "./scripts/joinUser.cjs";

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

    socket.on("join", (data: joinI) => {
      console.log("join", data);
      username = data.username;
      room = data.room;

      join(socket, connectedUsers, username, room);
    });

    socket.on("disconnect", () => {
      disconnectUser(socket, connectedUsers, username);
      emitDisconnect(socket, io, roomIds, usersInVoice);
      popOut(socketIds, usersInVoice, roomIds, socket.id);
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
        user: username,
        message: message,
        date: datetime,
        isFile: false,
        _id: _id,
        edited: false,
      };
      socket.emit("M_S_O", sdata);
      socket.in(room).emit("M_S_O", sdata);
      // console.log("sent (1)", room, message, "from", username);
    });

    socket.on("deleteMessage", async (data: deleteMessageI): Promise<void> => {
      MessageModel.find({ _id: data._id }).remove().exec();
      socket.in(data.room).emit("messageDeleted", { _id: data._id });
    });

    socket.on("editMessage", async (data: editMessageI) => {
      let filter = { _id: data._id };
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
          socket.emit("M_S_O", doc);
          socket.in(room).emit("M_S_O", doc);
          console.log("file sent:", doc._id, doc.originalName);
        }
      );
    });

    socket.on("attachEmoji", async (data: attachEmojiI) => {
      console.log("server received emoji:", data.emoji, data._id, data._user);
      let message: any = await MessageModel.findOne({ _id: data._id });

      let found = false;
      let suspend = false;
      let num = 1;
      message.emojis.forEach((emoji: any) => {
        if (emoji.emoji === data.emoji) {
          if (emoji.users.includes(data._user) === false) {
            emoji.num += 1;
            emoji.users.push(data._user);
            found = true;
            num = emoji.num;
          } else {
            suspend = true;
          }
        }
      });
      if (suspend) {
        return;
      } else if (found === false) {
        message.emojis.push({ emoji: data.emoji, num: 1, users: [data._user] });
      }

      let jData = {
        emoji: data.emoji,
        num: num,
        _id: data._id,
      };
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
  const connectedUsers: connectedUsersT = await usersStatus();
  console.log(connectedUsers);

  main(connectedUsers);
})();
