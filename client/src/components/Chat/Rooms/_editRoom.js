import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";
import packageJson from "../../../../package.json";

import { addRooms, addRoom } from "../../../features/interfaces";
import { togglePopupAdd, togglePopupEdit } from "../../../features/toggle";

import "./_editRoom.sass";

const apiLink = packageJson.proxy;

const PopupEditRoom = () => {
  const sendEditCommand = (event, newName) => {
    let elementId = toggleData.editingCatId;
    if (newName !== "") {
      axios
        .post(`${apiLink}/api/editCategory`, {
          catId: elementId,
          newCatName: newName,
        })
        .then((res) => {
          if (res.data.status === "done") {
            // update category name

            // setDisplay(false);
            dispatch(togglePopupEdit());
            let newJson = reduxData.rooms.map((cat) => {
              if (cat._id === elementId) {
                return {
                  name: newName,
                  position: cat.position,
                  voice: cat.voice,
                  __v: cat.__v,
                  _id: cat._id,
                };
              } else return cat;
            });

            dispatch(addRooms({ rooms: newJson }));
          } else if (res.data.status === "try_again") {
            alert("try again...");
          }
        })
        .catch((err) => console.error(err));
    }
  };
  const newNameRef = useRef();

  const reduxData = useSelector((state) => state.interfaces.value);
  const toggleData = useSelector((state) => state.toggle.value);
  const dispatch = useDispatch();

  const [defValue, setDefValue] = useState();

  useEffect(() => {
    reduxData.rooms.forEach((el) => {
      if (el._id === toggleData.editingCatId) {
        setDefValue(el.name);
        return;
      }
    });
  }, []);

  return (
    <div className="popup">
      <div className="center">
        <h4 className="label">New Name:</h4>
        <input
          className="nameInput"
          rows="1"
          columns="20"
          ref={newNameRef}
          defaultValue={defValue}
        />

        <div className="buttons">
          <h4 className="cancel" onClick={() => dispatch(togglePopupEdit())}>
            CANCEL
          </h4>
          <h4
            className="go"
            onClick={(event) =>
              sendEditCommand(event, newNameRef.current.value)
            }
          >
            GO
          </h4>
        </div>
      </div>
    </div>
  );
};

const PopupAddRoom = () => {
  const voiceChat = () => {
    return options.voice;
  };
  const handleCheckBox = (event) => {
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
  const sendAddCommand = (event, name) => {
    if (name !== "") {
      // alert("function not available...");
      axios
        .post(`${apiLink}/api/addCategory`, { name: name, voice: voiceChat() })
        .then((res) => {
          if (res.data.status === "done") {
            let id = res.data._id;

            dispatch(togglePopupAdd());
            dispatch(
              addRoom({
                room: { name: name, voice: voiceChat(), _id: id },
              })
            );
          } else if (res.data.status === "try_again") {
            dispatch(togglePopupAdd());
            alert("try again...");
          }
        })
        .catch((err) => console.error(err));
    }
  };
  const newNameRef = useRef();

  // const reduxData = useSelector((state) => state.interfaces.value);
  const dispatch = useDispatch();

  const [options, setOptions] = useState({ chat: true, voice: false });

  return (
    <div className="popup">
      <div className="center">
        <h4 className="label">New Room:</h4>
        <input
          rows="1"
          columns="20"
          ref={newNameRef}
          className="nameInput"
          placeholder="name"
        />{" "}
        {/*
            placeholder="not supported"
            disabled
          */}
        <form>
          <input
            type="checkbox"
            onChange={handleCheckBox}
            name="options"
            value="chat"
            // defaultChecked={true}
            checked={options.chat}
          />
          chat room
          <input
            type="checkbox"
            onChange={handleCheckBox}
            name="options"
            value="voice"
            checked={options.voice}
          />
          voice room
        </form>
        <div className="buttons">
          <h4 className="cancel" onClick={() => dispatch(togglePopupAdd())}>
            CANCEL
          </h4>
          <h4
            className="go"
            onClick={(event) => sendAddCommand(event, newNameRef.current.value)}
          >
            GO
          </h4>
        </div>
      </div>
    </div>
  );
};

export { PopupEditRoom, PopupAddRoom };
