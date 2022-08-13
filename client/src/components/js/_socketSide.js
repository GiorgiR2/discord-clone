import io from "socket.io-client";

import getTime from "./getTime";

import packageJson from "../../../package.json";

const main = (room, username, setElement, setOnline, setOffline) => {
  if (socket.disconnected) socket = io.connect(domain);

  socket.emit("join", {
    room: room,
    username: username,
  });
  console.log("sent join", room, username);
  // socket.on('connect', () => {
  // console.log("connected", room, username);
  // socket.emit('join', {
  //     room: room,
  //     username: username,
  // });
  // });

  socket.on("M_S_O", (data) => {
    console.log(data);
    setElement({
      user: data.user,
      msg: data.isFile ? data._id : data.message,
      date: data.date,
      isFile: data.isFile,
    });
  });

  socket.on("messagesData", (data) => {
    data.forEach((el) => {
      setElement({
        user: el.user,
        msg: el.isFile ? el._id : el.message,
        date: el.date,
        isFile: el.isFile,
      });
    });
  });

  socket.on("online", (data) => {
    console.log("online:", data);
    setOnline("");
    setOnline(data.username);
  });

  socket.on("offline", (data) => {
    setOffline("");
    setOffline(data.username);
  });

  socket.on("status", (data) => {
    console.log("status:", data);
    data.forEach((el) => {
      if (el.status === "online") setOnline(el.username);
      else setOffline(el.username);
    });
  });
};

// const urlify = (text) => {
//   var urlRegex = /(https?:\/\/[^\s]+)/g;
//   return text.replace(urlRegex, function (url) {
//     return `</a12>${url}</a12>`;
//   });
// };

const sendFileData = (
  e,
  user,
  room,
  roomId,
  datetime,
  size,
  filename,
  authentication
) => {
  e.preventDefault();
  const data = {
    user: user,
    room: room,
    roomId: roomId,
    datetime: datetime,
    size: size,
    authentication: authentication,
    filename: filename,
  };

  console.log("sent...........", data);

  socket.emit("file", data);

  e.preventDefault();
};

const sendMessage = (
  e,
  user,
  room,
  roomId,
  authentication,
  device,
  inputRef
) => {
  if (
    ((e.key === "Enter" && e.shiftKey !== true) || device === "mobile") &&
    inputRef.current.value != null
  ) {
    let message = inputRef.current.value;
    let datetime = getTime();

    let sdata = {
      authentication: authentication,
      username: user,
      message: message,
      datetime: datetime,
      room: room,
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

export { socket, main, sendMessage, sendFileData, disconnect };
