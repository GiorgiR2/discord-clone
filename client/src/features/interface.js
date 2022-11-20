import { createSlice } from "@reduxjs/toolkit";

const initalStateValues = {
  toggleLeft: false,
  toggleRight: false,
};

export const userSlice = createSlice({
  name: "interfaces",
  initialState: {
    value: initalStateValues,
  },
  reducers: {
    toggleLeft: (state) => {
      state.value.toggleLeft = !state.value.toggleLeft;
    },
    toggleRight: (state) => {
      state.value.toggleRight = !state.value.toggleRight;
    },
  },
});

export const { toggleLeft, toggleRight } = userSlice.actions;

export default userSlice.reducer;
