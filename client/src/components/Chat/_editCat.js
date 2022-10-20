import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import axios from "axios";
import packageJson from "../../../package.json";

import {
  togglePopupAdd,
  togglePopupEdit,
  addRooms,
} from "../../features/users";

import "./_editCat.sass";

const apiLink = packageJson.proxy;

const PopupEditCat = () => {
  const sendEditCommand = (event, newName) => {
    let elementId = reduxData.editingCatId;
    if (newName !== "") {
      axios
        .post(`${apiLink}/api/editCat`, {
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
          } else if (res.data.status === "try again") {
            alert("try again...");
          }
        })
        .catch((err) => console.error(err));
    }
  };
  const newNameRef = useRef();

  const reduxData = useSelector((state) => state.users.value);
  const dispatch = useDispatch();

  return (
    <div className="popup">
      <div className="center">
        <h4 className="label">New Name:</h4>
        <input rows="1" columns="20" ref={newNameRef} />

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

const PopupAddCat = () => {
  const sendAddCommand = (event, newName) => {
    if (newName !== "") {
      alert("function not available...");
      // axios.post("/api/addCat", { newCatName: newName })
      // .then(res => {
      //     if (res.data.status === "done"){
      //         // add cat
      //         let newJson = [...catJson, ];

      //         setCatJson(newJson);
      //     }
      //     else if (res.data.status === "try again"){
      //         alert("try again...");
      //     }
      // })
      // .catch(err => console.error(err));
    }
  };
  const newNameRef = useRef();

  // const reduxData = useSelector((state) => state.users.value);
  const dispatch = useDispatch();

  return (
    <div className="popup">
      <div className="center">
        <h4 className="label">Add Category:</h4>

        <input
          rows="1"
          columns="20"
          ref={newNameRef}
          placeholder="not supported"
          disabled
        />

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

export { PopupEditCat, PopupAddCat };
