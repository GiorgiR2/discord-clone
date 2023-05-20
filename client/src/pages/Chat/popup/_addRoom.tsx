import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";
import packageJson from "../../../../package.json";

import { addRoom } from "../../../features/interfaces";
import { togglePopupAdd } from "../../../features/toggle";

import "./_popup.sass";
import { optionsI } from "../../../types/types";
import { RootState } from "../../..";

const Speaker: string = require("../../../assets/volume_up_black_24dp.svg").default;

const apiLink = packageJson.proxy;

const PopupAddRoom: React.FC = () => {
  const voiceChat = () => {
    return options.voice;
  };
  const handleCheckBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    let focusOn = event.target.value;
    if (event.target.checked) {
      if (focusOn === "chat") {
        setOptions({ chat: true, voice: false });
      } else {
        setOptions({ chat: false, voice: true });
      }
    } else if (!event.target.checked) {
      if (focusOn === "chat") {
        setOptions({ chat: false, voice: true });
      } else {
        setOptions({ chat: true, voice: false });
      }
    }
  };
  const sendAddCommand = (name: string) => {
    if (name !== "") {
      axios
        .post(`${apiLink}/api/addRoom`, {
          authentication: reduxData.authentication,
          username: reduxData.currentUser,
          name,
          voice: voiceChat() })
        .then((res) => {
          const { success, _id } = res.data;
          if (success) {
            dispatch(togglePopupAdd());
            dispatch(
              addRoom({
                room: { name, voice: voiceChat(), _id },
              })
            );
          } else if (success === false) {
            dispatch(togglePopupAdd());
            alert("try again...");
          }
        })
        .catch((err) => console.error(err));
    }
  };
  const newNameRef = useRef(null);

  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const dispatch = useDispatch();

  const [options, setOptions] = useState<optionsI>({ chat: true, voice: false });

  return (
    <div className="popup">
      <div className="center">
        <h4 className="mainTitle">Create Room</h4>
        <form>
          <h5>channel type</h5>
          <span>
            <div className="title">
              <h5 className="icon sharp">#</h5>
              <h5 className="title">chat room</h5>
            </div>
            <input
              type="checkbox"
              onChange={handleCheckBox}
              name="options"
              value="chat"
              // defaultChecked={true}
              checked={options.chat}
            />
          </span>
          <span>
            <div className="title">
              {/* <h5 className="icon">{"<)"}</h5> */}
              <img
                className="icon speaker"
                src={Speaker}
                alt="speaker"
              />
              <h5 className="title">voice room</h5>
            </div>
            <input
              type="checkbox"
              onChange={handleCheckBox}
              name="options"
              value="voice"
              checked={options.voice}
            />
          </span>
        </form>
        <div className="inputDiv">
          {options.chat ? <h5>#</h5> :
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
            placeholder="name"
          />{" "}
        </div>
        <div className="buttons">
          <h5 className="cancel" onClick={() => dispatch(togglePopupAdd())}>
            CANCEL
          </h5>
          <h5
            className="go" // @ts-expect-error
            onClick={(event) => sendAddCommand(newNameRef.current.value)}
          >
            GO
          </h5>
        </div>
      </div>
    </div>
  );
};

export default PopupAddRoom;