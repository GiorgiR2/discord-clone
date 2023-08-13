import { createSlice } from "@reduxjs/toolkit";
import { messageI } from "../types/types";

interface messagesInitialStateValueI {
  messages: messageI[];
}

const initialStateValue: messagesInitialStateValueI = {
  messages: [
    // username, message, date, isFile, fileName, id, editMode
  ],
};

export const userSlice = createSlice({
  name: "messages",
  initialState: {
    value: initialStateValue,
  },
  reducers: {
    addMessage: (state, action) => {
      state.value.messages = [
        ...state.value.messages,
        ...action.payload.messageList,
      ];
    },
  },
});

export const { addMessage } = userSlice.actions;

export default userSlice.reducer;