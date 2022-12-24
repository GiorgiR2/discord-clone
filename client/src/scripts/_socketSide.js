import io from "socket.io-client";

import getTime from "./getTime";
import packageJson from "../../package.json";

import {
  setOnline,
  setOffline,
  addMessage,
  removeMessage,
} from "../features/users";

const main = (reduxData, dispatch) => {
  if (socket.disconnected) socket = io.connect(domain);

  socket.emit("join", {
    room: reduxData.currentRoom,
    username: reduxData.currentUser,
  });
  console.log("sent join", reduxData.currentRoom, reduxData.currentUser);
  // socket.on('connect', () => {
  // console.log("connected", room, username);
  // socket.emit('join', {
  //     room: room,
  //     username: username,
  // });
  // });

  socket.on("M_S_O", (data) => {
    let msgList = [
      [
        data.user,
        data.isFile ? data._id : data.message,
        data.date,
        data.isFile,
        data.isFile ? data.originalName : "",
      ],
    ];

    dispatch(addMessage({ messageList: msgList })); // message/messages
  });

  socket.on("messagesData", (data) => {
    let msgList = data.map((el) => {
      return [
        el.user,
        el.isFile ? el._id : el.message,
        el.date,
        el.isFile,
        el.isFile ? el.originalName : "",
        el._id,
      ];
    });
    dispatch(addMessage({ messageList: msgList })); // message/messages
  });

  socket.on("messageDeleted", (data) => {
    dispatch(removeMessage({ _id: data.id }));
  });

  socket.on("online", (data) => {
    console.log("online:", data);
    dispatch(setOnline({ name: data.username }));
  });

  socket.on("offline", (data) => {
    dispatch(setOffline({ name: data.username }));
  });

  socket.on("status", (data) => {
    console.log("status:", data);
    data.forEach((el) => {
      if (el.status === "online") dispatch(setOnline({ name: el.username }));
      else dispatch(setOffline({ name: el.username }));
    });
  });
};

// const urlify = (text) => {
//   var urlRegex = /(https?:\/\/[^\s]+)/g;
//   return text.replace(urlRegex, function (url) {
//     return `</a12>${url}</a12>`;
//   });
// };

const sendDeleteStatus = (id) => {
  socket.emit("deleteMessage", { _id: id });
};

const sendFileData = (e, reduxData, roomId, datetime, size, filename) => {
  // e.preventDefault();
  const data = {
    user: reduxData.currentUser,
    room: reduxData.currentRoom,
    roomId: roomId,
    datetime: datetime,
    size: size,
    authentication: reduxData.authentication,
    filename: filename,
  };

  socket.emit("file", data);
  console.log("sent...........", data);

  // e.preventDefault();
};

const sendMessage = (e, reduxData, roomId, device, inputRef) => {
  let input = inputRef.current.value;
  if (
    ((e.key === "Enter" && e.shiftKey !== true) || device === "mobile") &&
    input !== null &&
    input !== 0
  ) {
    let message = input;
    let datetime = getTime();

    let sdata = {
      authentication: reduxData.authentication,
      username: reduxData.currentUser,
      message: message,
      datetime: datetime,
      room: reduxData.currentRoom,
      roomId: roomId,
    };

    socket.emit("message", sdata);
    // e.target.value = "";
    inputRef.current.value = "";
    // e.persist();
    e.preventDefault();
  }
};

const disconnect = () => socket.disconnect();

const domain = packageJson.proxy;
var socket = io.connect(domain);

export {
  socket,
  main,
  sendMessage,
  sendFileData,
  sendDeleteStatus,
  disconnect,
};
