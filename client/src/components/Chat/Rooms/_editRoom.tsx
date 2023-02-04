import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";
import packageJson from "../../../../package.json";

import { addRooms, addRoom } from "../../../features/interfaces";
import { togglePopupAdd, togglePopupEdit } from "../../../features/toggle";

import "./_editRoom.sass";
import { optionsI, roomI } from "../../../types/types";
import { RootState } from "../../..";

const apiLink = packageJson.proxy;

const PopupEditRoom: React.FC = () => {
  const sendEditCommand = (newName: string | undefined | null) => {
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
            let newJson = reduxData.rooms.map((cat: roomI) => {
              if (cat._id === elementId) {
                return { //__v: cat.__v,
                  name: newName,
                  position: cat.position,
                  voice: cat.voice,
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
  const newNameRef = useRef(null);

  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const toggleData = useSelector((state: RootState) => state.toggle.value);
  const dispatch = useDispatch();

  const [defValue, setDefValue] = useState<string>();

  useEffect(() => {
    reduxData.rooms.forEach((el: roomI) => {
      if (el._id === toggleData.editingCatId) {
        setDefValue(el.name);
        return;
      }
    });
  }, []);

  return (
    <div className="popup">
      <div className="center">
        <h4 className="mainTitle">rename</h4>
        <div className="inputDiv">
          <h5>#</h5>
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
  const sendAddCommand = (name: any) => {
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
  const newNameRef = useRef(null);

  // const reduxData = useSelector((state) => state.interfaces.value);
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
              <h5 className="icon">#</h5>
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
              <h5 className="icon">{"<)"}</h5>
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
          <h5>#</h5>
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

export { PopupEditRoom, PopupAddRoom };