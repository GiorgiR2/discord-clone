
import { useState } from "react";
import "./_inputComponent.sass";

const userSVG: string = require("../../../assets/login/user.svg").default;
const lockSVG: string = require("../../../assets/login/lock.svg").default;
const eyeSVG: string = require("../../../assets/login/eye.svg").default;

interface InputComponentI {
  input?: any;
  setInput?: (value: string | ((prevState: string) => string)) => void;
  // icon: any;
  className?: string;
  defaultText: string;
  type: "text" | "password";
}

const InputComponent = ({ input, setInput, className, defaultText, type }: InputComponentI) => {
  const [displayPassword, setDisplayPassword] = useState(false);

  return (
  <div className={`input ${className}`}>
    <img src={type === "text" ? userSVG : lockSVG} alt="icon" className="icon"/>
    <input
      type={displayPassword ? "text" : type}
      className=""
      placeholder={defaultText}
      ref={input}
      onChange={(event) => setInput ? setInput(event.target.value) : null}
    />
    {type === "password" ?
    <img src={eyeSVG} alt="icon" className="eye"
        onClick={(event) => {
          // event.preventDefault();
          setDisplayPassword(false);
          }}
        onMouseDown={(event) => {
          // event.preventDefault();
          setDisplayPassword(true);
        }
        } /> : null}
  </div>);
}

export default InputComponent;