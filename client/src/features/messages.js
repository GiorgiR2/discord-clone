import { createSlice } from "@reduxjs/toolkit";

const initialStateValue = {
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
