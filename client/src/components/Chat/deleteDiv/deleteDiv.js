import "./deleteDiv.sass";

import { useEffect, useRef } from "react";

import { useDispatch } from "react-redux";
import { closeContext } from "../../../features/interface";

import { TrashSVG, EditSVG } from "../../../styles/SVGs/_SVGs";

// hook is taken out of interet
const useOnClickOutside = (ref, handler) => {
  useEffect(
    () => {
      const listener = (event) => {
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

const DeleteDiv = ({ x, y }) => {
  const editMSG = () => {
    //Todo: send edit message using sockets
  };
  const deleteMSG = (id) => {
    //Todo: send delete message using sockets
  };

  const closeContextMenu = (e) => {
    dispatch(closeContext());
  };

  const dispatch = useDispatch();

  const contextMenuRef = useRef(null);
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
          <li id="edit" onClick={editMSG}>
            <h3 className="edit">edit</h3>
            <EditSVG id="001" typeE="message" />
          </li>
          <li id="delete" onClick={deleteMSG}>
            <h3 className="delete">delete</h3>
            <TrashSVG id="001" typeE="message" />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DeleteDiv;
