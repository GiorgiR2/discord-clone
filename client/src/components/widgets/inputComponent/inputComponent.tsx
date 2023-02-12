
import { useState } from "react";
import { JsxElement } from "typescript";
import "./_inputComponent.sass";

const userSVG: string = require("../../../assets/login/user.svg").default;
const lockSVG: string = require("../../../assets/login/lock.svg").default;
const eyeSVG: string = require("../../../assets/login/eye.svg").default;

interface InputComponentI {
  input: any;
  // icon: any;
  className?: string;
  defaultText: string;
  type: "text" | "password";
}

const InputComponent = ({ input, className, defaultText, type }: InputComponentI) => {
  const [displayPassword, setDisplayPassword] = useState(false);

  return (
  <div className={`input ${className}`}>
    <img src={type === "text" ? userSVG : lockSVG} alt="icon" className="icon"/>
    <input
      type={displayPassword ? "text" : type}
      className=""
      placeholder={defaultText}
      ref={input}
    />
    {type === "password" ? <img src={eyeSVG} alt="icon" className="eye" onClick={() => setDisplayPassword(false)} onMouseDown={() => setDisplayPassword(true)} /> : null}
  </div>);
}

export default InputComponent;