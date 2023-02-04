import axios from "axios";

import { togglePopupEdit, addEditingCatId } from "../../features/toggle";
import { addRooms } from "../../features/interfaces";

import { useDispatch, useSelector } from "react-redux";

import packageJson from "../../../package.json";
import { roomI } from "../../types/types";
import { RootState } from "../..";

const Edit: string = require("./edit.svg").default;
const Trash: string = require("./trash.svg").default;

// const changeMode = (a, b, c) => {};

const apiLink = packageJson.proxy;

const EditSVG = ({ id }: { id: string }): JSX.Element => {
  const editCat = () => {
    dispatch(addEditingCatId({ id: id }));
    dispatch(togglePopupEdit());
  };
  // const toggleData = useSelector((state) => state.toggle.value);
  const dispatch = useDispatch();

  return (
    <img
      onClick={() => editCat()}
      src={Edit}
      alt="edit"
    />
  );
};

const TrashSVG = ({ id }: { id: string }): JSX.Element => {
  // typeE === "room" || "message"
  const trash = () => {
    // e.preventDefault();
    axios
      .post(`${apiLink}/api/deleteCategory`, { deleteId: id })
      .then((res) => {
        if (res.data.status === "deleted") {
          let newj: roomI[] = [];
          reduxData.rooms.forEach((cat: roomI) => {
            if (cat._id !== id) newj.push(cat);
          });

          dispatch(addRooms({ rooms: newj }));
        }
      })
      .catch((err) => console.error(err));
  };
  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const dispatch = useDispatch();

  return (
    <img
      onClick={() => trash()}
      src={Trash}
      alt="trash"
    />
  );
};

export { EditSVG, TrashSVG };