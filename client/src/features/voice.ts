import { createSlice } from "@reduxjs/toolkit";
import { voiceInitialStateValueI } from "../types/types";

const initalStateValue: voiceInitialStateValueI = {
  currentStatus: "", // No Video
  localStream: null,
  mediaData: { audio: true, video: true, screen: false },
  screenBeenShared: false,
  remoteUsers: [], // {from: "", user: "", status: ""}
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
    setCurrentStatus: (state, action) => {
      state.value.currentStatus = action.payload.status;
    },
    turnOffVideo: (state) => {
      state.value.mediaData.video = false;
    },
    setScreenSharing: (state, action: {payload: { status: boolean }}) => {
      state.value.mediaData.screen = action.payload.status;
    },
    setScreenBeenShared: (state, action) => {
      state.value.screenBeenShared = action.payload.status;
    },
    changeRemoteStatus: (state, action) => {
      state.value.remoteUsers = state.value.remoteUsers.map((user) => {
        // console.log("id:", user.from);
        if (user.from === action.payload.id) {
          // console.log("changing...");
          return { ...user, status: action.payload.status };
        } else {
          return user;
        }
      });
    },
    disconnectRemoteUser: (state, action) => {
      state.value.remoteUsers = state.value.remoteUsers.filter(
        (user) => user.from !== action.payload.id
      );
      state.value.remoteStreams = state.value.remoteStreams.filter(
        (stream) => stream[0] !== action.payload.id
      );
    },
  },
});

export const {
  addRemoteUser,
  setMediaData,
  addStream,
  addLocalStream,
  setCurrentStatus,
  turnOffVideo,
  setScreenSharing,
  setScreenBeenShared,
  changeRemoteStatus,
  disconnectRemoteUser,
} = userSlice.actions;

export default userSlice.reducer;
