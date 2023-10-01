import { createSlice } from "@reduxjs/toolkit";
import scrollToBottom from "../utils/scrollToBottom";
import { attachEmojiRX, editMessageI, interfaceInitialStateValueI, messageI, modeI } from "../types/types";

const initialStateValue: interfaceInitialStateValueI = {
  authentication: "",
  currentUser: "",
  currentRoom: "",
  currentRoomId: "",
  rooms: [],
  draggingRoomId: null,
  draggingRoomIndex: -1,
  online: [],
  offline: [],
  messages: [],
  oldMessagesLoaded: 0, // 5x
  newMessagesLoaded: 0,
  voiceMode: false,
  focusMessageId: null,
  reactedBy: [],
};

export const userSlice = createSlice({
  name: "users",
  initialState: {
    value: initialStateValue,
  },
  reducers: {
    addUserName: (state, action) => {
      state.value.currentUser = action.payload.username;
    },
    addRooms: (state, action) => {
      state.value.rooms = action.payload.rooms; // elements of [name, position, voice, __v, _id]
    },
    addRoom: (state, action) => {
      state.value.rooms.push(action.payload.room); // name, voice, _id
    },
    setRoomName: (state, action) => {
      state.value.currentRoom = action.payload.name;
    },
    setRoomId: (state, action) => {
      state.value.currentRoomId = action.payload.roomId;
    },
    setAuthentication: (state, action) => {
      state.value.authentication = action.payload.authentication;
    },
    setVoiceMode: (state, action) => {
      state.value.voiceMode = action.payload.bool;
    },
    setOnline: (state, action) => {
      let valuesOnline = state.value.online;
      let valuesOffline = state.value.offline;
      let newName = action.payload.name;
      if (
        !valuesOnline.find((value) => {
          return value === newName;
        })
      ) {
        // add to onlines
        state.value.online = [...valuesOnline, newName];
        // remove from offlines
        state.value.offline = valuesOffline.filter(
          (value) => value !== newName
        );
      }
    },
    setOffline: (state, action) => {
      let valuesOffline = state.value.offline;
      let valuesOnline = state.value.online;
      let newName = action.payload.name;
      if (
        !valuesOffline.find((value) => {
          return value === newName;
        })
      ) {
        // add to offlines' list
        state.value.offline = [...valuesOffline, newName];
        // remove from onlines' list
        state.value.online = valuesOnline.filter((value) => value !== newName);
      }
    },
    addMessage: (state, action: { payload: { messageList: messageI[] } }) => {
      if (state.value.messages.length >= 1 && action.payload.messageList.length > 1) {
        return;
      }
      action.payload.messageList.forEach((message: messageI) => {
        state.value.messages.push(message);
      });
      scrollToBottom();
    },
    removeMessage: (state, action: modeI) => {
      // state.value.messages = state.value.messages.filter(
      //   (el) => el[5] !== action.payload._id
      // );
      state.value.messages = state.value.messages.filter(
        (el) => el._id !== action.payload.id
      );
    },
    enterFocusMode: (state, action: modeI) => {
      state.value.messages = state.value.messages.map((message) => {
        if (message._id === action.payload.id) {
          return { ...message, focusMode: true };
        } else return message;
      });
    },
    exitFocusMode: (state, action: modeI) => {
      state.value.messages = state.value.messages.map((message) => {
        if (message._id === action.payload.id) {
          return { ...message, focusMode: false };
        } else return message;
      });
    },
    enterEditMode: (state, action: modeI) => {
      state.value.messages = state.value.messages.map((message) => {
        if (message._id === action.payload.id) {
          return { ...message, editMode: true };
        } else return message;
      });
    },
    exitEditMode: (state, action: modeI) => {
      state.value.messages = state.value.messages.map((message) => {
        if (message._id === action.payload.id) {
          return { ...message, editMode: false };
        } else return message;
      });
    },
    editMessage: (state, action: editMessageI) => {
      state.value.messages = state.value.messages.map((message) => {
        if (message._id === action.payload.id) {
          // do not touch this part
          let msg = action.payload.messageHTML
            .replace("</div><div>", "<br>")
            .replace("<div>", "")
            .replace("</div>", "<br>");
          // console.log(msg);
          return {
            ...message,
            message: msg.substring(0, msg.length - 4).replaceAll("<br>", "\n"),
            edited: true
          };
        } else return message;
      });
    },

    attachEmoji: (state, action: attachEmojiRX) => {
      state.value.messages = state.value.messages.map((message) => {
        if (message._id === action.payload._id) {
          let found = false;
          let newEmojis = message.emojis.map(emojiData => {
            if (emojiData.emoji === action.payload.emoji) {
              emojiData.num += 1;
              found = true;
              return emojiData;
            }
            return emojiData;
          });
          if (found === false) {
            message.emojis.push({ emoji: action.payload.emoji, num: 1 });
          }
          else {
            message.emojis = newEmojis;
          }

          return message;
        }
        else {
          return message;
        }
      });
    },
    removeEmoji: (state, action) => {
      //pass
    },

    clearAll: (state) => {
      state.value = initialStateValue;
    },

    rememberDraggingRoom: (state, action) => {
      state.value.draggingRoomId = action.payload.id;
      state.value.draggingRoomIndex = action.payload.index;
    },
    // changePosition: (state, action) => {
    //   state.value.draggingRoomIndex = action.payload.index;
    // },
    modifyPosition: (state, action) => {
      if (action.payload.index === state.value.draggingRoomIndex) {
        return;
      }

      let focusRoom = state.value.rooms[state.value.draggingRoomIndex];
      let newRooms = state.value.rooms.filter(
        (room) => room._id !== state.value.draggingRoomId
      );
      let newRooms1 = [];
      newRooms.forEach((room, n) => {
        if (n === action.payload.index && room._id !== action.payload._id) {
          newRooms1.push(focusRoom);
        }
        newRooms1.push(room);
      });

      if (newRooms1.length === action.payload.index) {
        newRooms1.push(focusRoom);
      }
      state.value.rooms = newRooms1;
    },

    setReactedBy: (state, action) => {
      state.value.focusMessageId = action.payload.messageId;
      state.value.reactedBy = action.payload.users;
    },
    cleanReactedBy: (state) => {
      state.value.focusMessageId = null;
      state.value.reactedBy = [];
    },

    incrementOldMessagesLoaded: (state) => {
      state.value.oldMessagesLoaded++;
    },
    incrementNewMessagesLoaded: (state) => {
      state.value.newMessagesLoaded++;
    },
    decrementNewMessagesLoaded: (state) => {
      state.value.newMessagesLoaded--;
    },
    addMessagesToTop: (state, action) => {
      let newMessages = action.payload.messages;
      //newMessages.reverse();
      newMessages.forEach((message: messageI) => {
        state.value.messages.unshift(message);
      })
    },
  },
});

export const {
  addUserName,
  addRooms,
  addRoom,
  setRoomName,
  setRoomId,

  setAuthentication,
  setVoiceMode,

  setOnline,
  setOffline,

  addMessage,
  removeMessage,

  attachEmoji,

  enterFocusMode,
  exitFocusMode,

  enterEditMode,
  exitEditMode,
  editMessage,

  rememberDraggingRoom,
  // changePosition,
  modifyPosition,

  setReactedBy,
  cleanReactedBy,

  clearAll,

  incrementOldMessagesLoaded,
  incrementNewMessagesLoaded,
  decrementNewMessagesLoaded,
  addMessagesToTop,
} = userSlice.actions;

export default userSlice.reducer;
