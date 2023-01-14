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

  socket.on("M_S_O", (data) => {
    let msgList = [
      {
        username: data.user,
        message: data.isFile ? data._id : data.message,
        date: data.date,
        isFile: data.isFile,
        fileName: data.isFile ? data.originalName : "",
        id: data._id,
        editMode: false,
      },
    ];

    dispatch(addMessage({ messageList: msgList })); // message/messages
  });

  socket.on("messagesData", (data) => {
    let msgList = data.map((el) => {
      return {
        username: el.user,
        message: el.isFile ? el._id : el.message,
        date: el.date,
        isFile: el.isFile,
        fileName: el.isFile ? el.originalName : "",
        id: el._id,
        editMode: false,
      };
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

const editMessage = (messageHTML, id) => {
  socket.emit("editMessage", { messageHTML: messageHTML, _id: id });
};

const sendDeleteStatus = (id) => {
  socket.emit("deleteMessage", { _id: id });
};

const sendFileData = (e, reduxData, roomId, datetime, size, filename) => {
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
  editMessage,
  disconnect,
};
