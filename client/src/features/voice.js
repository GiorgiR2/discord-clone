import { createSlice } from "@reduxjs/toolkit";

const initalStateValue = {
  currentStatus: "No Video",
  localStream: null,
  mediaData: { audio: false, video: true },
  remoteUsers: [], // {id: "", name: "", status: ""}
  remoteStreams: [], // [..., [id, stream]] // "id": stream
};

export const userSlice = createSlice({
  name: "voice",
  initialState: {
    value: initalStateValue,
  },
  reducers: {
    addRemoteUser: (state, action) => {
      state.value.remoteUsers = [...state.value.remoteUsers, action.payload];
    },
    removeRemoteUser: (state, action) => {
      //pass
    },
    setLocalStream: (state, action) => {
      //pass
    },
    setMediaData: (state, action) => {
      state.value.mediaData = action.payload.data;
    },
    addStream: (state, action) => {
      state.value.remoteStreams = [
        ...state.value.remoteStreams,
        action.payload.stream,
      ];
      // state.value.remoteStreams[action.payload.stream[0]] =
      //   action.payload.stream[1];
    },
    addLocalStream: (state, action) => {
      state.value.localStream = action.payload.stream;
    },
  },
});

export const {
  addRemoteUser,
  removeRemoteUser,
  setMediaData,
  addStream,
  addLocalStream,
} = userSlice.actions;

export default userSlice.reducer;
