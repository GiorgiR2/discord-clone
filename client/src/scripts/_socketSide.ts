import io from "socket.io-client";

import getTime from "../utils/getTime";
import packageJson from "../../package.json";

import { setOnline, setOffline, addMessage, removeMessage, attachEmoji, setRoomName, setRoomId, setVoiceMode } from "../features/interfaces";
import { messageI, sendFileDataI, emojiT, attachEmojiI, interfaceInitialStateValueI } from "../types/types";

type dataIMSG = messageI & { originalName: string };

const main = (roomId: string, username: string, dispatch: any) => {
  if (socket.disconnected) {
    // @ts-expect-error
    socket = io.connect(domain);
  }

  socket.emit("join", { roomId, _username: username });
  console.log("sent join", roomId, username);

  socket.on("roomName", (data: { name: string, roomId: string, voice: boolean }) => {
    const { roomId, voice, name } = data;
    dispatch(setRoomId({ roomId }));
    dispatch(setVoiceMode({ bool: voice }));
    dispatch(setRoomName({ name }));
  });

  socket.on("message", (data: dataIMSG) => {
    const { user, isFile, _id, message, date, originalName, edited, emojis } = data;
    let msgList: messageI = {
      user,
      message: isFile ? _id : message,
      date,
      isFile,
      fileName: isFile ? originalName : "",
      _id,
      focusMode: false,
      editMode: false,
      edited,
      emojis: emojis === undefined ? [] : emojis,
    };

    dispatch(addMessage({ messageList: [msgList] }));
  });

  socket.on("messages", (data: dataIMSG[]) => {
    let msgList: messageI[] = data.map((el: dataIMSG) => (
      {
        user: el.user,
        message: el.isFile ? el._id : el.message,
        date: el.date,
        isFile: el.isFile,
        fileName: el.isFile ? el.originalName : "",
        _id: el._id,
        focusMode: false,
        editMode: false,
        edited: el.edited,
        emojis: el.emojis === undefined ? [] : el.emojis,
      }
    ));
    dispatch(addMessage({ messageList: msgList })); // message/messages
  });

  socket.on("messageDeleted", (data: { success: boolean, _id?: string, status?: string }) => {
    const { _id, success, status } = data;
    if(success && _id){
      dispatch(removeMessage({ _id }));
    }
    else if(!success && status){
      alert(status);
    }
  });

  socket.on("online", (data: any) => {
    const { username } = data;
    console.log("online:", username);
    dispatch(setOnline({ name: username }));
  });

  socket.on("offline", (data: any) => {
    const { username } = data;
    console.log("offline:", username);
    dispatch(setOffline({ name: username }));
  });

  socket.on("status", (data: any) => {
    for (const [username, value] of Object.entries(data)) {
      // @ts-ignore
      if (value.status === "online")
        dispatch(setOnline({ name: username }));
      else
        dispatch(setOffline({ name: username }));
    }
  });

  socket.on("newEmoji", (data: attachEmojiI) => {
    const { _id, emoji, num } = data;
    console.log("received:", emoji, num, _id);
    dispatch(attachEmoji({ _id, emoji, num }));
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

const sendDeleteStatus = (reduxData: interfaceInitialStateValueI, _id: string | null) => {
  console.log("delete", reduxData.authentication,  reduxData.currentUser);
  socket.emit("deleteMessage", { 
    messageId: _id,
    username: reduxData.currentUser,
    hash: reduxData.authentication,
  });
};

const sendFileData = ({ reduxData, _id, size, filename }: sendFileDataI) => {
  const { currentRoom, authentication } = reduxData;
  const data = {
    _id,
    room: currentRoom,
    size,
    authentication,
    filename,
  };

  socket.emit("file", data);
  console.log("sent...........", data);
};

const sendMessage = (reduxData: interfaceInitialStateValueI, roomId: string, message: string) => {
  const { authentication, currentUser, currentRoom } = reduxData;
  let datetime = getTime();
  let sdata = {
    authentication,
    message,
    datetime,
    roomId,
    room: currentRoom,
    username: currentUser,
  };

  socket.emit("message", sdata);
};

const attackEmoji = (_id: string, emoji: emojiT, room: string, user: string) => {
  socket.emit("attachEmoji", { _id, emoji, room, user });
}

const disconnect = () => socket.disconnect();

const domain = packageJson.proxy;
// @ts-expect-error
var socket = io.connect(domain);

export { socket, main, sendMessage, sendFileData, sendDeleteStatus, editMessage, disconnect, attackEmoji };