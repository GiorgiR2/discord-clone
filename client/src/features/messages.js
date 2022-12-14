import { createSlice } from "@reduxjs/toolkit";

//messages: [...{name: "", message: "", date: "", isFile: false, id: ""}, ]
const initialStateValue = {
  messages: [],
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
