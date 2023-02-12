import React, { useRef, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";

import InputComponent from "./inputComponent/inputComponent";

import { getBasicData } from "../../scripts/_getBasicData";
import packageJson from "../../../package.json";

import "./_style.sass";

const userSVG: string = require("../../assets/login/user.svg").default;

const apiLink = packageJson.proxy;

interface dataI {
  username: string;
  password0: string;
  password1: string;
}

const SignUp = () => {
  const sendData = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const data: dataI = {
      username: username.current.value,
      password0: password0,
      password1: password1,
    };

    axios
      .post(`${apiLink}/api/users/register`, data)
      .then((res) => {
        console.log("res", res.data);
        if (res.data.data === "done") {
          username.current.value = "";
          setPassword0("");
          setPassword1("");
          alert("registration was successful");
          // history.push("/?status=done");
          // window.location.reload();
        } else alert("try again, something went wrong...");
      })
      .catch((err) => console.log(err));
  };
  const strength = (password: string) => {
    let answer = 0;
    ",.<>/?'][{]\\|()-_=+!@#$%^&*~`".split("").forEach(el => {
      if (password.includes(el)){
        answer++;
      }
    });
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(el => {
      if (password.includes(el.toString())){
        answer++;
      }
    });
    return answer;
  }

  const username = useRef<any>(null);
  const [password0, setPassword0] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");

  const [passwordStatus, setPasswordStatus] = useState<"" | "weak" | "normal" | "strong">("");
  const [match, setMatch] = useState<"" | "passwords must match" | "match">("");

  const history = useHistory();
  // let { signup } = useParams();

  useEffect(() => {
    document.title = "sign up";
    getBasicData({ history });
  }, []);

  useEffect(() => {
    let password = password0;
    if (password === ""){
      setPasswordStatus("");
    }
    else if(password.length < 5){
      setPasswordStatus("weak");
    }
    else if (password.length >= 5 && strength(password) > 3){
      setPasswordStatus("strong");
    }
    else{
      setPasswordStatus("normal")
    }
  }, [password0]);

  useEffect(() => {
    if(password0 === password1 && password0 !== ""){
      setMatch("match");
    }
    else if (password1.length === 0){
      setMatch("");
    }
    else{
      setMatch("passwords must match");
    }
  }, [password1]);

  return (
    <div className="sign-up">
      <div className="top">
        <img src={userSVG} alt="user" className="user" />
        <h2 className="title">Member sign up</h2>
      </div>

      <InputComponent input={username} className="" defaultText="Username" type="text" />
      <div className="signup-password">
        <InputComponent setState={setPassword0} className="" defaultText="Password" type="password" />
        <h5 className={`${passwordStatus !== "" ? "display" : ""} ${passwordStatus === "strong" ? "green" : ""}`}>{passwordStatus}</h5>
      </div>
      <div className="signup-password">
        <InputComponent setState={setPassword1} className="" defaultText="Repeat password" type="password" />
        <h5 className={`${match !== "" ? "display" : ""} ${match === "match" ? "green" : ""}`}>{match}</h5>
      </div>

      <button className="button margin-top" onClick={(event) => sendData(event)}>
        SIGN UP
      </button>
      <a href="#" className="back">
        ← go back
      </a>
    </div>
  );
};

export default SignUp;
