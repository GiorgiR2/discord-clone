import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import Login from "./components/Login/Login";
import SignUp from "./components/Signup/Sign_Up";
import Chat from "./components/Chat/Chat";

import "./styles/_main.sass";

import packageJson from "../package.json";

const startPoint =
  window.location.href.toString().includes("localhost") ||
  window.location.href.toString().includes("127.0.0.1")
    ? ""
    : "/discord-clone-react"; //packageJson.homepage;

const mainT = startPoint + "/";
const signUpT = startPoint + "/signup";
const chatT = startPoint + "/chat/:roomId";

const App = () => {
  useEffect(() => {
    console.log(startPoint);
  });

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={mainT} component={Login} />
        <Route exact path={signUpT} component={SignUp} />
        {/* <Route exact path="/chat/id=:id" component={Chat} /> */}
        <Route exact path={chatT} component={Chat} />
        <Route exact component={Chat} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
