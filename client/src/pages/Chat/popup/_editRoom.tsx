import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";
import packageJson from "../../../../package.json";

import { addRooms } from "../../../features/interfaces";
import { togglePopupEdit } from "../../../features/toggle";

import "./_popup.sass";
import { roomI } from "../../../types/types";
import { RootState } from "../../..";

const Speaker: string = require("../../../assets/volume_up_black_24dp.svg").default;

const apiLink = packageJson.proxy;

const PopupEditRoom: React.FC = () => {
  const sendEditCommand = (newName: string | undefined | null) => {
    const _id = toggleData.editingCatId;
    if (newName !== "") {
      axios
        .post(`${apiLink}/api/editRoom`, {
          authentication: reduxData.authentication,
          username: reduxData.currentUser,
          _id,
          newName
        })
        .then((res) => {
          if (res.data.success) {
            dispatch(togglePopupEdit());
            let newJson = reduxData.rooms.map((cat: roomI) => {
              if (cat._id === _id) {
                return {
                  name: newName,
                  position: cat.position,
                  voice: cat.voice,
                  _id: cat._id,
                };
              } else return cat;
            });

            dispatch(addRooms({ rooms: newJson }));
          } else if (!res.data.success) {
            alert("try again...");
          }
        })
        .catch((err) => console.error(err));
    }
  };
  const newNameRef = useRef(null);

  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const toggleData = useSelector((state: RootState) => state.toggle.value);
  const dispatch = useDispatch();

  const [defValue, setDefValue] = useState<string>();
  const [voice, setVoice] = useState<boolean>(false);

  useEffect(() => {
    console.log("id", toggleData.editingCatId)
    reduxData.rooms.forEach((el: roomI) => {
      if (el._id === toggleData.editingCatId) {
        setDefValue(el.name);
        setVoice(el.voice);
        return;
      }
    });
  }, []);

  return (
    <div className="popup">
      <div className="center">
        <h4 className="mainTitle">rename</h4>
        <div className="inputDiv">
          {!voice ? <h5>#</h5> :
            <img
              className=""
              src={Speaker}
              alt="speaker"
            />
          }
          <input // @ts-expect-error
            rows="1"
            columns="20"
            ref={newNameRef}
            className="nameInput"
            defaultValue={defValue}
          />{" "}
        </div>

        <div className="buttons">
          <h5 className="cancel" onClick={() => dispatch(togglePopupEdit())}>
            CANCEL
          </h5>
          <h5
            className="go"
            onClick={(event) => // @ts-expect-error
              sendEditCommand(newNameRef.current.value)
            }
          >
            GO
          </h5>
        </div>
      </div>
    </div>
  );
};

export default PopupEditRoom;