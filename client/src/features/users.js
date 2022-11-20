import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = {
  authentication: "",
  currentUser: "",
  currentRoom: "",
  currentRoomId: "",
  rooms: [], // all mongodb data
  online: [],
  offline: [],
  messages: [
    // name, message, date, isFile=false
    ["name", "message", "date", false],
  ],
  displayEdit: false,
  editingCatId: "",
  displayAdd: false,
  voiceMode: false,
};

export const userSlice = createSlice({
  name: "users",
  initialState: {
    value: initialStateValue,
  },
  reducers: {
    togglePopupEdit: (state) => {
      state.value.displayEdit = !state.value.displayEdit;
    },
    togglePopupAdd: (state) => {
      state.value.displayAdd = !state.value.displayAdd;
    },
    addEditingCatId: (state, action) => {
      state.value.editingCatId = action.payload.id;
    },
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
        // add to offlines
        state.value.offline = [...valuesOffline, newName];
        // remove from onlines
        state.value.online = valuesOnline.filter((value) => value !== newName);
      }
    },
    addMessage: (state, action) => {
      state.value.messages = [
        ...state.value.messages,
        ...action.payload.messageList,
      ];
    },

    clearAll: (state) => {
      state.value = initialStateValue;
    },
  },
});

export const {
  togglePopupEdit,
  togglePopupAdd,
  addEditingCatId,
  addUserName,
  addRooms,
  addRoom,
  setRoomName,
  setAuthentication,
  setVoiceMode,
  setOnline,
  setOffline,
  addMessage,

  clearAll,
} = userSlice.actions;

export default userSlice.reducer;
