import { useState } from "react";

import { useParams, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import packageJson from "../../../../package.json";

import {
  rememberDraggingRoom,
  changePosition,
  modifyPosition,
} from "../../../features/interfaces";

import { EditSVG, TrashSVG } from "../../../styles/SVGs/_SVGs";

const apiLink = packageJson.proxy;

const RoomsJSX = () => {
  const onDragStart = (event, id, index) => {
    //step 1: redux - add _id as active with its position number
    // console.log("drag started, id:", id);
    dispatch(rememberDraggingRoom({ id: id, index: index }));
  };
  const onDragEnter = (event, n) => {
    // Todo: add underline on current position
    // console.log("drag enter, index:", n);
    setIndex(n);
    // dispatch(changePosition({ index: n }));
  };
  const onDragEnd = (event) => {
    //step 2: redux - finally modify list of rooms and send a command to the back-end for changing mongodb data
    // console.log("drag ended");
    axios
      .post(`${apiLink}/api/changeRoomPosition`, {
        roomId: reduxData.draggingRoomId,
        draggingRoomIndex: reduxData.draggingRoomIndex,
        finalIndex: index,
      })
      .then((res) => {
        if (res.data.status === "done") {
          dispatch(modifyPosition({ index: index }));
          setIndex(null);
        }
      })
      .catch((err) => console.error(err));
  };

  const [index, setIndex] = useState(null);

  let { _, hashId } = useParams();
  const history = useHistory();

  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.interfaces.value);

  return reduxData.rooms.map((room, n) => (
    <li
      className={`category ${index === n ? "activePlace" : ""}`}
      id={room._id}
      draggable
      onDragStart={(e) => onDragStart(e, room._id, n)}
      onDragEnter={(e) => onDragEnter(e, n)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <a
        className="hyperlink"
        onClick={() => {
          history.push(`/chat/${room._id}/${hashId}`);
          window.location.reload();
        }}
      >
        # {room.name}
      </a>
      <div className="svgs">
        <EditSVG id={room._id} typeE="room" />{" "}
        {/* set redux editingCatId as id */}
        <TrashSVG id={room._id} typeE="room" />
      </div>
    </li>
  ));
};

export default RoomsJSX;
