import React from "react";

import { useDispatch } from "react-redux";
import { toggleLeft, toggleRight } from "../../features/interface";

import "./sidePanel.sass";

const Panel = ({ side }) => {
  // side == left || right
  const dispatch = useDispatch();

  return (
    <>
      <div
        className="panel"
        onClick={() =>
          side === "right" ? dispatch(toggleRight()) : dispatch(toggleLeft())
        }
      >
        <div />
        <div />
        <div />
      </div>
    </>
  );
};

export default Panel;
