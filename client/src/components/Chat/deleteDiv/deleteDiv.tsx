import "./deleteDiv.sass";

import React, { useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { closeContext } from "../../../features/toggle";
import { removeMessage, enterEditMode } from "../../../features/interfaces";

import { sendDeleteStatus } from "../../../scripts/_socketSide";

import { TrashSVG, EditSVG } from "../../../styles/SVGs/_SVGs";
import { RootState } from "../../..";
import { messageI } from "../../../types/types";

// This hook is taken out of internet
const useOnClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
  handler: (evnet: any) => void
) => {
  useEffect(
    () => {
      const listener = (event: any) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };
      document.addEventListener("mousedown", listener);
      document.addEventListener("touchstart", listener);
      return () => {
        document.removeEventListener("mousedown", listener);
        document.removeEventListener("touchstart", listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
};

interface DeleteDivI {
  x: number;
  y: number;
  id: string | null;
}

const DeleteDiv: React.FC<DeleteDivI> = ({ x, y, id }) => {
  const closeContextMenu = (): void => {
    dispatch(closeContext());
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
      alert("can't edit a file message...");
    } else if (reduxData.currentUser !== messageUser) {
      alert("You do not have the privilege to edit that message...");
    } else {
      dispatch(enterEditMode({ _id: id }));
    }
    closeContextMenu();
  };
  const deleteMSG = (id: string | null) => {
    //Todo: remove message from redux states && send delete message using sockets
    console.log("delete:", id);
    let messageUser;
    reduxData.messages.forEach((msg) =>
      msg._id === id ? (messageUser = msg.user) : null
    );
    if (reduxData.currentUser !== messageUser) {
      alert("You do not have the privilege to delete that message...");
    } else {
      dispatch(removeMessage({ _id: id }));
      sendDeleteStatus(id);
    }
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
      {/*<h4>options</h4>*/}
      <nav>
        <ul>
          <li id="edit" onClick={() => editMSG(id)}>
            <h3 className="edit">Edit Message</h3>
            <EditSVG id="001" typeE="message" />
          </li>
          <li id="delete" onClick={() => deleteMSG(id)}>
            <h3 className="delete">Delete Message</h3>
            <TrashSVG id="001" typeE="message" />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DeleteDiv;
