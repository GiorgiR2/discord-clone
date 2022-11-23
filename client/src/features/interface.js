import { createSlice } from "@reduxjs/toolkit";

const initalStateValues = {
  toggleLeft: false,
  toggleRight: false,
  contextMenu: { show: false, x: 0, y: 0 },
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
    setContextMenu: (state, action) => {
      state.value.contextMenu = action.payload.contextMenu;
    },
    closeContext: (state) => {
      state.value.contextMenu.show = false;
    },
  },
});

export const { toggleLeft, toggleRight, setContextMenu, closeContext } =
  userSlice.actions;

export default userSlice.reducer;
