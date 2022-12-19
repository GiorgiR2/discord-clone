import { createSlice } from "@reduxjs/toolkit";

const initalStateValue = {
  users: [
    { name: "giorgir0", camOn: false, minOn: false, remoteScreen: false },
    { name: "giorgir1", camOn: false, minOn: false, remoteScreen: false },
  ],
  servers: {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  },
};

export const userSlice = createSlice({
  name: "voice",
  initialState: {
    value: initalStateValue,
  },
  reducers: {
    addUser: (state, action) => {
      state.value.users = action.payload.newUser;
    },
    removeUser: (state, action) => {
      //pass
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;

export default userSlice.reducer;
