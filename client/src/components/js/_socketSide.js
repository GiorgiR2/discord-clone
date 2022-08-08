import io from "socket.io-client";

import getTime from "./getTime";

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
    setOnline("");
    setOnline(data.username);
  });

  socket.on("offline", (data) => {
    setOffline("");
    setOffline(data.username);
  });

  socket.on("status", (data) => {
    data.forEach((el) => {
      if (el.status === "online") setOnline(el.username);
      else setOffline(el.username);
    });
  });
};

const urlify = (text) => {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return `</a12>${url}</a12>`;
  });
};

const sendFileData = (
  e,
  username,
  room,
  roomId,
  datetime,
  size,
  filename,
  authentication
) => {
  e.preventDefault();
  const data = {
    username: username,
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

const sendMessage = (e, user, room, roomId, authentication) => {
  if (e.key === "Enter" && e.shiftKey !== true && e.target.value != null) {
    let message = e.target.value;
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
    e.target.value = "";
    e.preventDefault();
  }
};

const disconnect = () => socket.disconnect();

const domain = `http://${window.location.hostname}:5000`;
var socket = io.connect(domain);

export { socket, main, sendMessage, sendFileData, disconnect };
