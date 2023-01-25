import React, { useState, useEffect } from "react";
import { useHistory, Link, useLocation } from "react-router-dom"; // { Link, Redirect }
import axios from "axios";

import { getBasicData } from "../../scripts/_getBasicData";

import "./_login.sass";
import packageJson from "../../../package.json";

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
  const sendLoginData = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    user: string,
    password: string
  ) => {
    e.preventDefault();
    let data = {
      username: user,
      password: password,
    };

    axios
      .post(`${apiLink}/api/users/login`, data, config)
      .then((res) => {
        if (res.data.status === "done") {
          if (remember === true) {
            rememberUser(res.data.hashId);
          }

          console.log("data:", res.data.roomId, res.data.hashId);
          history.push(`/chat/${res.data.roomId}/${res.data.hashId}`); // /?id=${res.data.data}
          window.location.reload();
        } else {
          alert("Try again...");
        }
      })
      .catch((err) => console.error("error...", err));
  };

  document.title = "login section";

  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const history = useHistory();

  const [remember, setRemember] = useState(false);

  // const queryParams = new URLSearchParams(window.location.search);
  // console.log(queryParams.get('status')===null);
  useEffect(() => {
    // if (queryParams.get("status") === "done") {
    // successfully registered
    // alert("registration is done...");
    // }

    getBasicData({ history });
  }, []);

  return (
    <div className="login">
      <h2 className="LogInTitle">Login</h2>
      <h2 className="usernameLabel label">UserName:</h2>
      <h2 className="passwordLabel label">Password:</h2>

      <input
        type="text"
        className="e-name" // @ts-expect-error
        rows="1"
        cols="20"
        onChange={(event) => setUserName(event.target.value)}
      />
      <input
        type="password"
        className="e-pass" // @ts-expect-error
        rows="1"
        cols="20"
        onChange={(event) => setPassword(event.target.value)}
      />

      <button
        type="submit"
        className="go-button"
        onClick={(event) => sendLoginData(event, userName, password)}
      >
        GO
      </button>

      {/* <a href="/signup" className="sign-up-button">
        Sign up
</a>*/}
      <div className="rememberMe">
        <input
          type="checkbox"
          id="remember"
          onChange={(event) => setRemember(event.target.checked)}
          checked={remember}
        />
        <label>remember me</label>
      </div>

      <Link
        to="/signup"
        onClick={() => {
          history.push("signup");
          window.location.reload();
        }}
        className="sign-up-button"
      >
        SIGN UP
      </Link>
    </div>
  );
};

export default Login;
