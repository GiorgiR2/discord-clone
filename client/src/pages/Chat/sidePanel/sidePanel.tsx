import React from "react";

import { useDispatch } from "react-redux";
import { toggleLeft, toggleRight } from "../../../features/toggle";

import "./sidePanel.sass";

interface sideI {
  side: "left" | "right";
}

const Panel: React.FC<sideI> = ({ side }): JSX.Element => {
  const handler = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();

    if (side === "right") dispatch(toggleRight());
    else dispatch(toggleLeft());
  };
  // side == left || right
  const dispatch = useDispatch();

  return (
    <>
      <div className="panel" onClick={(event) => handler(event)}>
        <div />
        <div />
        <div />
      </div>
    </>
  );
};

export default Panel;
