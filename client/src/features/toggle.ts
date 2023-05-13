import { createSlice } from "@reduxjs/toolkit";
import { toggleInitialStateValueI } from "../types/types";

const initalStateValues: toggleInitialStateValueI = {
  toggleLeft: false,
  toggleRight: false,
  contextMenu: { show: false, x: 0, y: 0, id: null },
  displayEdit: false,
  displayAdd: false,
  displaySettings: false,
  editingCatId: null,
  toggleRooms: false,
};

export const userSlice = createSlice({
  name: "interfaces",
  initialState: {
    value: initalStateValues,
  },
  reducers: {
    addEditingCatId: (state, action) => {
      state.value.editingCatId = action.payload._id;
    },
    togglePopupEdit: (state) => {
      state.value.displayEdit = !state.value.displayEdit;
    },
    togglePopupAdd: (state) => {
      state.value.displayAdd = !state.value.displayAdd;
    },
    toggleSettings: (state) => {
      state.value.displaySettings = !state.value.displaySettings;
    },
    toggleLeft: (state) => {
      state.value.toggleLeft = !state.value.toggleLeft;
    },
    toggleRight: (state) => {
      state.value.toggleRight = !state.value.toggleRight;
    },
    toggleRooms: (state) => {
      state.value.toggleRooms = !state.value.toggleRooms;
    },

    setContextMenu: (state, action) => {
      state.value.contextMenu = action.payload.contextMenu;
    },
    closeContext: (state) => {
      state.value.contextMenu.show = false;
    },
    closeLeft: (state) => {
      state.value.toggleLeft = false;
    },
    closeRight: (state) => {
      state.value.toggleRight = false;
    },
  },
});

export const {
  togglePopupEdit,
  togglePopupAdd,
  toggleSettings,
  toggleRooms,
  addEditingCatId,

  toggleLeft,
  toggleRight,
  setContextMenu,
  closeContext,
  closeLeft,
  closeRight,
} = userSlice.actions;

export default userSlice.reducer;
