import React from "react";
import axios from "axios";

import { togglePopupEdit, addEditingCatId } from "../../features/users";

import { addRooms } from "../../features/users";
import { useDispatch, useSelector } from "react-redux";

import Edit from "./edit.svg";
import Trash from "./trash.svg";

import packageJson from "../../../package.json";

const changeMode = (a, b, c) => {};
const apiLink = packageJson.proxy;

const EditSVG = ({ id, typeE }) => {
  // typeE === "room" || "message" // ignore on "message"
  const editCat = (e) => {
    // e.preventDefault();
    dispatch(addEditingCatId({ id: id }));
    dispatch(togglePopupEdit());
  };
  const reduxData = useSelector((state) => state.users.value);
  const dispatch = useDispatch();

  return (
    <img
      onClick={(event) => (typeE === "room" ? editCat(event) : null)}
      src={Edit}
    />
  );
};

const TrashSVG = ({ id, typeE }) => {
  // typeE === "room" || "message"
  const trash = (e) => {
    // e.preventDefault();
    axios
      .post(`${apiLink}/api/deleteCategory`, { deleteId: id })
      .then((res) => {
        if (res.data.status === "deleted") {
          let newj = [];
          let newJson = reduxData.rooms.map((cat) => {
            if (cat._id !== id) newj.push(cat);
          });

          dispatch(addRooms({ rooms: newj }));
        }
      })
      .catch((err) => console.error(err));
  };
  const reduxData = useSelector((state) => state.users.value);
  const dispatch = useDispatch();

  return (
    <img
      onClick={(event) => (typeE === "room" ? trash(event) : null)}
      src={Trash}
    />
  );
};

export { EditSVG, TrashSVG };
