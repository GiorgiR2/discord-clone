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
  id: string;
}

const DeleteDiv = ({ x, y, id }: DeleteDivI) => {
  const closeContextMenu = (): void => {
    dispatch(closeContext());
    dispatch(exitFocusMode({ id }));
  };

  const editMSG = (id: string) => {
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
      dispatch(enterEditMode({ id }));
      dispatch(enterFocusMode({ id }));
    }
    closeContextMenu();
  };
  const deleteMSG = (id: string) => {
    // remove message from redux states && send delete message using sockets
    sendDeleteStatus(reduxData, id);
    closeContextMenu();
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
