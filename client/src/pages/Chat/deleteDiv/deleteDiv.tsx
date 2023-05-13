import React, { useRef } from "react";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";

import { useDispatch, useSelector } from "react-redux";
import { closeContext } from "../../../features/toggle";
import { enterEditMode, exitFocusMode, enterFocusMode } from "../../../features/interfaces";

import { sendDeleteStatus } from "../../../scripts/_socketSide";

import { RootState } from "../../..";
import { messageI } from "../../../types/types";

import "./deleteDiv.sass";

const EditSVG: string = require("../../../assets/chat/options/edit.svg").default;
const TrashSVG: string = require("../../../assets/chat/options/trash.svg").default;

interface DeleteDivI {
  x: number;
  y: number;
  id: string | null;
}

const DeleteDiv: React.FC<DeleteDivI> = ({ x, y, id }) => {
  const closeContextMenu = (): void => {
    dispatch(closeContext());
    dispatch(exitFocusMode({ _id: id as string }));
  };

  const editMSG = (id: string | null) => {
    //Todo: send edit message using sockets
    console.log("edit:", id);
    let messageUser, isFile;
    reduxData.messages.forEach((msg: messageI) => {
      if (msg._id === id) {
        messageUser = msg.user;
        isFile = msg.isFile;
      }
    });
    if (isFile) {
      alert("can't edit a file...");
    } else if (reduxData.currentUser !== messageUser) {
      alert("You do not have privileges to edit that message...");
    } else {
      dispatch(enterEditMode({ _id: id as string }));
      dispatch(enterFocusMode({ _id: id as string }));
    }
    closeContextMenu();
  };
  const deleteMSG = (_id: string | null) => {
    //Todo: remove message from redux states && send delete message using sockets
    sendDeleteStatus(reduxData, _id);
    closeContextMenu();
    // dispatch(removeMessage({ _id: _id as string }));
    // let messageUser;
    // reduxData.messages.forEach((msg) =>
    //   msg._id === id ? (messageUser = msg.user) : null
    // );
    // if (reduxData.currentUser !== messageUser) {
    //   alert("You do not have privileges to delete that message...");
    // } else {
    //   dispatch(removeMessage({ _id: id as string }));
    //   sendDeleteStatus(reduxData, id);
    // }
  };

  const dispatch = useDispatch();
  const reduxData = useSelector((state: RootState) => state.interfaces.value);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(contextMenuRef, closeContextMenu);

  return (
    <div
      ref={contextMenuRef}
      className="options"
      style={{ top: `${y}px`, left: `${x}px` }}
    >
      {/*<h4>options</h4>*/}
      <nav>
        <ul>
          <li id="edit" onClick={() => editMSG(id)}>
            <h3 className="edit">Edit Message</h3>
            <img src={EditSVG} alt="edit" />
          </li>
          <li id="delete" onClick={() => deleteMSG(id)}>
            <h3 className="delete">Delete Message</h3>
            <img className="trash" src={TrashSVG} alt="trash" />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DeleteDiv;
