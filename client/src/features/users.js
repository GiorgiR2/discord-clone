import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = {
  authentication: "",
  currentUser: "",
  currentRoom: "",
  currentRoomId: "",
  rooms: [],
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
    login: (state, action) => {
      state.value = action.payload;
    },
    logout: (state) => {
      // pass
    },
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
      state.value.rooms = action.payload.rooms;
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
      state.value.online = [...state.value.online, action.payload.name];
    },
    setOffline: (state, action) => {
      state.value.offline = [...state.value.offline, action.payload.name];
    },
    addMessage: (state, action) => {
      state.value.messages = [
        ...state.value.messages,
        ...action.payload.messageList,
      ];
    },
  },
});

export const {
  login,
  logout,
  togglePopupEdit,
  togglePopupAdd,
  addEditingCatId,
  addUserName,
  addRooms,
  setRoomName,
  setAuthentication,
  setVoiceMode,
  setOnline,
  setOffline,
  addMessage,
} = userSlice.actions;

export default userSlice.reducer;
