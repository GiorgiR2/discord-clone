import axios from "axios";

import { addRooms } from "../../../features/interfaces";

import { useDispatch, useSelector } from "react-redux";

import packageJson from "../../../../package.json";
import { roomI } from "../../../types/types";
import { RootState } from "../../..";

const TrashSVG: string = require("../../../assets/chat/options/trash.svg").default;

const apiLink = packageJson.proxy;

interface idI{ _id: string };

const Trash = ({ _id }: idI): JSX.Element => {
  const trash = () =>
    axios
      .post(`${apiLink}/api/deleteRoom`, { authentication: reduxData.authentication, username: reduxData.currentUser, _id })
      .then((res) => {
        if (res.data.success) {
          let newj: roomI[] = [];
          reduxData.rooms.forEach((cat: roomI) => {
            if (cat._id !== _id) newj.push(cat);
          });

          dispatch(addRooms({ rooms: newj }));
        }
        else{
          alert("You need admin privileges to delete rooms");
        }
      })
      .catch((err) => console.error(err));
  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const dispatch = useDispatch();

  return <img onClick={() => trash()} src={TrashSVG} alt="trash" />;
};

export default Trash;