import React, { useRef, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";

import InputComponent from "../widgets/inputComponent/inputComponent";

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
      password0: password0.current.value,
      password1: password1.current.value,
    };

    axios
      .post(`${apiLink}/api/users/register`, data)
      .then((res) => {
        console.log("res", res.data);
        if (res.data.data === "done") {
          username.current.value = "";
          password0.current.value = "";
          password1.current.value = "";
          alert("registration was successful");
          // history.push("/?status=done");
          // window.location.reload();
        } else alert("try again, something went wrong...");
      })
      .catch((err) => console.log(err));
  };
  const username = useRef<any>(null);
  const password0 = useRef<any>(null);
  const password1 = useRef<any>(null);

  const history = useHistory();
  // let { signup } = useParams();

  document.title = "sign up";

  useEffect(() => {
    getBasicData({ history });
  }, []);

  return (
    <div className="sign-up">
      <div className="top">
        <img src={userSVG} alt="user" className="user" />
        <h2 className="title">Member sign up</h2>
      </div>

      <InputComponent input={username} className="" defaultText="Username" type="text" />
      <InputComponent input={password0} className="" defaultText="Password" type="password" />
      <InputComponent input={password1} className="" defaultText="Repeat password" type="password" />

      <button className="button margin-top" onClick={(event) => sendData(event)}>
        SIGN UP
      </button>
      {/* <a href="#" className="back">
        go back
      </a> */}
      {/* <Link
        to="/"
        onClick={() => {
          history.push("/");
          window.location.reload();
        }}
        className="go-back-button"
      >
        go back
      </Link> */}
    </div>
  );
};

export default SignUp;
