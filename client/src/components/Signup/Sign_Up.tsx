import React, { useState, useRef, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";

import { getBasicData } from "../../scripts/_getBasicData";
import packageJson from "../../../package.json";

import "./_sign-up.sass";

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
  const username = useRef<any>("");
  const password0 = useRef<any>("");
  const password1 = useRef<any>("");

  const history = useHistory();
  // let { signup } = useParams();

  document.title = "sign up";

  useEffect(() => {
    getBasicData({ history });
  }, []);

  return (
    <div className="sign-up">
      <h2 className="signUpTitle">sign up</h2>
      <h2 className="usernameLabel label">UserName:</h2>
      <h2 className="passwordLabel0 label">Password:</h2>
      <h2 className="passwordLabel1 label">Repeat Password:</h2>

      <input
        type="text"
        className="e-name 234535353" // @ts-expect-error
        rows="1"
        cols="15"
        ref={username}
      />
      <input
        type="password"
        className="pass0"
        autoComplete="on" // @ts-expect-error
        rows="1"
        cols="15"
        ref={password0}
      />
      <input
        type="password"
        className="pass1"
        autoComplete="on" // @ts-expect-error
        rows="1"
        cols="15"
        ref={password1}
      />
      <button className="go-button" onClick={(event) => sendData(event)}>
        GO
      </button>
      {/*<a href="/" className="go-back-button">
        go back
</a>*/}
      <Link
        to="/"
        onClick={() => {
          history.push("/");
          window.location.reload();
        }}
        className="go-back-button"
      >
        go back
      </Link>
    </div>
  );
};

export default SignUp;
