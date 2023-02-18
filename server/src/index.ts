import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { usersStatus } from "./ts/userOperations.cjs";
import * as msgOps from "./ts/msgOperations.cjs";

import MessageModel, { messageSchemaI } from "./models/message.model.cjs";

import { connectedUsersT, usersInVoiceI } from "./types/types.cjs";
import { attachEmojiI, deleteMessageI, editMessageI, fileI, joinI, messageIS } from "./types/sockets.js";

import "./mongooseAPI.cjs";
import dotenv from "dotenv";

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
    console.log("new connection", socket.id);

    socket.on("join", (data: joinI) => {
      console.log("join", data);
      username = data.username;

      if (connectedUsers[username] === undefined) {
        connectedUsers[username] = {
          status: "online",
          tabsOpen: 1,
        };
      }
      else if (connectedUsers[username].tabsOpen < 1) {
        connectedUsers[username].status = "online";

        socket.broadcast.emit("online", {
          username: username,
        });
        connectedUsers[username].tabsOpen = 1;
      }
      else {
        connectedUsers[username].tabsOpen += 1;
      }

      socket.emit("status", connectedUsers);

      MessageModel.find({
        room: data.room,
      })
        .sort("number")
        .exec()
        .then((doc: messageSchemaI[]) => {
          socket.emit("messagesData", doc);
        });

      socket.join(data.room);
    });

    socket.on("disconnect", () => {
      if (connectedUsers[username] !== undefined) {
        connectedUsers[username].tabsOpen -= 1;
        if (connectedUsers[username].tabsOpen <= 0) {
          socket.broadcast.emit("offline", {
            username: username,
          });
          connectedUsers[username].status = "offline";
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

      // Todo: implement new code to pop out disconnected users
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

    socket.on("message", async (data: messageIS) => {
      let authentication = data.authentication;
      let user = data.username;
      let message = data.message;
      let datetime = data.datetime;
      let room = data.room;

      let _id = msgOps.addToMongoose({ ...data, isFile: false });

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
      console.log(`%cmsg: ${msg}`, 'color: red');
      // msg = msg.substring(0, msg.length - 4);
      msg = replaceAll(msg, "<br>", "\n");

      let update = { message: msg, edited: true };
      MessageModel.findOneAndUpdate(filter, update).exec();
    });

    socket.on("file", async (data: fileI) => {
      // let authentication = data.authentication;
      // let user = data.user;
      // let datetime = data.datetime;
      // let roomId = data.roomId;

      let room = data.room;
      let size = data.size;
      let filename = data.filename;

      MessageModel.findOne({ size: size, originalName: filename })
        .then((doc: any) => {
          socket.emit("M_S_O", doc);
          socket.in(room).emit("M_S_O", doc);
          console.log("file sent:", doc._id, filename);
        });
    });

    socket.on("attachEmoji", async (data: attachEmojiI) => {
      console.log("server received emoji:", data.emoji, data._id, data._user);
      let message: any = await MessageModel.findOne({ _id: data._id });

      let found = false, suspend = false;
      let num = 1;
      message.emojis.forEach((emoji: any) => {
        if (emoji.emoji === data.emoji) {
          if (emoji.users.includes(data._user) === false) {
            emoji.num += 1;
            emoji.users.push(data._user);
            found = true;
            num = emoji.num;
          }
          else {
            suspend = true;
          }
        }
      });
      if (suspend) {
        return;
      }
      else if (found === false) {
        message.emojis.push({ emoji: data.emoji, num: 1, users: [data._user] });
      }

      let jData = {
        emoji: data.emoji,
        num: num,
        _id: data._id
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
  return str.replace(new RegExp(escapeRegExp(match), 'g'), () => replacement);
}

(async () => {
  const connectedUsers: connectedUsersT = await usersStatus();
  console.log(connectedUsers);

  main(connectedUsers);
})();
