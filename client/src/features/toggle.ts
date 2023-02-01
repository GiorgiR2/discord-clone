import { createSlice } from "@reduxjs/toolkit";
import { toggleInitialStateValueI } from "../types/types";

const initalStateValues: toggleInitialStateValueI = {
  toggleLeft: false,
  toggleRight: false,
  contextMenu: { show: false, x: 0, y: 0, id: null },
  displayEdit: false,
  editingCatId: null,
  displayAdd: false,
};

export const userSlice = createSlice({
  name: "interfaces",
  initialState: {
    value: initalStateValues,
  },
  reducers: {
    addEditingCatId: (state, action) => {
      state.value.editingCatId = action.payload.id;
    },
    togglePopupEdit: (state) => {
      state.value.displayEdit = !state.value.displayEdit;
    },
    togglePopupAdd: (state) => {
      state.value.displayAdd = !state.value.displayAdd;
    },
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

export const {
  togglePopupEdit,
  togglePopupAdd,
  addEditingCatId,

  toggleLeft,
  toggleRight,
  setContextMenu,
  closeContext,
} = userSlice.actions;

export default userSlice.reducer;
