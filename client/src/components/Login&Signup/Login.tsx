import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom"; // { Link, Redirect }

import axios from "axios";

import encrypt from "../js/encrypt";
import { getBasicData } from "../../scripts/_getBasicData";

import "./_style.sass";
import packageJson from "../../../package.json";
import InputComponent from "./inputComponent/inputComponent";

const userSVG: string = require("../../assets/login/user.svg").default;

const apiLink = packageJson.proxy;

const config: { [key: string]: string } = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};

const Login = () => {
  const rememberUser = (hashId: string) => {
    console.log(`remember hashId: ${hashId}`);
    localStorage.setItem("hashId", hashId);
  };
  const sendLoginData = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, user: string, password: string) => {
    e.preventDefault();

    const hashedPassword = encrypt(password);
    let data = {
      username: user,
      password: hashedPassword,
    };

    axios
      .post(`${apiLink}/api/users/login`, data, config)
      .then((res) => {
        if (res.data.success) {
          const { hashId, roomId } = res.data;
          if (remember === true) {
            rememberUser(hashId);
          }

          console.log("data:", roomId, hashId);
          history.push(`/chat/${roomId}/${hashId}`); // /?id=${res.data.data}
          window.location.reload();
        } else {
          alert(res.data.status);
        }
      })
      .catch((err) => console.error("error...", err));
  };

  // const username = useRef<any>(null);
  // const password = useRef<any>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const history = useHistory();

  const [remember, setRemember] = useState(false);

  useEffect(() => {
    document.title = "login";
    getBasicData({ history });
  }, []);

  return (
    <div className="login">
      <div className="top">
        <img src={userSVG} alt="user" className="user" />
        <h2 className="title">Member login</h2>
      </div>

      <InputComponent input={username} setInput={setUsername} defaultText="username" type="text" />
      <InputComponent input={password} setInput={setPassword} defaultText="password" type="password" />

      <div className="rememberMe">
        <input
          type="checkbox"
          id="remember"
          onChange={(event) => setRemember(event.target.checked)}
          checked={remember}
        />
        <label>remember me</label>
      </div>

      <button
        type="submit"
        className="button"
        onClick={(event) => sendLoginData(event, username, password)}
      >
        login
      </button>

      <div className="account">
        <h5>Don't have an account?</h5>
        <Link
          to="/signup"
          onClick={() => {
            history.push("signup");
            window.location.reload();
          }}
          className="signUp"
        >
          sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
