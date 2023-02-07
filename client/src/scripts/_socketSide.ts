import io from "socket.io-client";

import getTime from "./getTime";
import packageJson from "../../package.json";

import {
  setOnline,
  setOffline,
  addMessage,
  removeMessage,
} from "../features/interfaces";
import { messageI, statusI, sendMessageI, sendFileDataI } from "../types/types";

const main = (reduxData: any, dispatch: any) => {
  if (socket.disconnected){
    // @ts-expect-error
    socket = io.connect(domain);
  }

  socket.emit("join", {
    room: reduxData.currentRoom,
    username: reduxData.currentUser,
  });
  console.log("sent join", reduxData.currentRoom, reduxData.currentUser);

  type dataIMSG = messageI & { originalName: string };
  socket.on("M_S_O", (data: dataIMSG) => {
    let msgList: messageI[] = [
      {
        user: data.user,
        message: data.isFile ? data._id : data.message,
        date: data.date,
        isFile: data.isFile,
        fileName: data.isFile ? data.originalName : "",
        _id: data._id,
        focusMode: false,
        editMode: false,
        edited: data.edited,
      },
    ];

    dispatch(addMessage({ messageList: msgList })); // message/messages
  });

  socket.on("messagesData", (data: dataIMSG[]) => {
    // type msgT = Omit<messageI, "focusMode">;
    let msgList: messageI[] = data.map((el: dataIMSG) => {
      return {
        user: el.user,
        message: el.isFile ? el._id : el.message,
        date: el.date,
        isFile: el.isFile,
        fileName: el.isFile ? el.originalName : "",
        _id: el._id,
        focusMode: false,
        editMode: false,
        edited: el.edited,
      };
    });
    dispatch(addMessage({ messageList: msgList })); // message/messages
  });

  socket.on("messageDeleted", (data: any) => {
    dispatch(removeMessage({ _id: data.id }));
  });

  socket.on("online", (data: any) => {
    console.log("online:", data);
    dispatch(setOnline({ name: data.username }));
  });

  socket.on("offline", (data: any) => {
    dispatch(setOffline({ name: data.username }));
  });

  socket.on("status", (data: any) => {
    console.log("status:", data);
    data.forEach((el: statusI) => {
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

const editMessage = (messageHTML: string, id: string) => {
  socket.emit("editMessage", { messageHTML: messageHTML, _id: id });
};

const sendDeleteStatus = (id: string | null) => {
  socket.emit("deleteMessage", { _id: id });
};

const sendFileData = ({ reduxData, roomId, datetime, size, filename }: sendFileDataI) => {
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

const sendMessage = ({event, reduxData, roomId, device, inputRef}: sendMessageI) => {
  let input = inputRef.current.value;
  if (
    ((event.key === "Enter" && event.shiftKey !== true) || device === "mobile") &&
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
    event.preventDefault();
  }
};

const disconnect = () => socket.disconnect();

const domain = packageJson.proxy;
// @ts-expect-error
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