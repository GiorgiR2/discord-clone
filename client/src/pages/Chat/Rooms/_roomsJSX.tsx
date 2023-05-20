import React, { useState } from "react";

import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";

import Trash from "./trash";
import Edit from "./edit";

import { rememberDraggingRoom, modifyPosition } from "../../../features/interfaces";

import { roomI } from "../../../types/types";
import { RootState } from "../../..";

import "./_roomsJSX.sass";
import packageJson from "../../../../package.json";

const Speaker: string = require("../../../assets/volume_up_black_24dp.svg").default;

const apiLink = packageJson.proxy;

const RoomsJSX = (): JSX.Element => {
  const onDragStart = (event: React.DragEvent<HTMLLIElement>, id: string, index: number): void => {
    //step 1: redux - add _id as active with its position number
    // console.log("drag started, id:", id);
    dispatch(rememberDraggingRoom({ id, index }));
  };
  const onDragEnter = (event: React.DragEvent<HTMLLIElement>, n: number) => {
    // Todo: add underline on current position
    // console.log("drag enter, index:", n);
    setIndex(n);
  };
  const onDragEnd = (event: React.DragEvent<HTMLLIElement>) => {
    //step 2: redux - finally modify list of rooms and send a command to the back-end for changing mongodb data
    // console.log("drag ended");
    axios
      .post(`${apiLink}/api/changeRoomPosition`, {
        authentication: reduxData.authentication,
        username: reduxData.currentUser,
        roomId: reduxData.draggingRoomId,
        draggingRoomIndex: reduxData.draggingRoomIndex,
        finalIndex: index,
      })
      .then((res) => {
        if (res.data.success) {
          dispatch(modifyPosition({ index }));
          setIndex(-1);
        }
      })
      .catch((err) => console.error(err));
  };
  const redirectToRoom = (room: roomI) => {
    history.push(`/chat/${room._id}/${hashId}`);
    window.location.reload();
  }

  const [index, setIndex] = useState<number>(-1);

  let { _, hashId } = useParams<{ _: string; hashId: string; }>();
  const history = useHistory();

  const dispatch = useDispatch();
  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const toggleRedux = useSelector((state: RootState) => state.toggle.value);

  return (
    <nav>
      <ul>
        {
          reduxData.rooms.map((room: roomI, n: number) => (
            <li
              className={`category ${index === n ? "activePlace" : ""} ${toggleRedux.toggleRooms && room.name !== reduxData.currentRoom ? "hideRoom" : ""}`}
              key={n}
              id={room._id}
              draggable
              onDragStart={(e) => onDragStart(e, room._id, n)}
              onDragEnter={(e) => onDragEnter(e, n)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="hyperlink" onClick={() => redirectToRoom(room)}>
                {room.voice ?
                  <img className="speaker" src={Speaker} alt="speaker" /> : <span className="sharp">#</span>} <span className="name">{room.name}</span>
              </div>
              <div className="svgs">
                <Edit _id={room._id} />{" "}
                {/* set redux editingCatId as id */}
                <Trash _id={room._id} />
              </div>
            </li>
          ))
        }
      </ul></nav>
  );
};

export default RoomsJSX;
