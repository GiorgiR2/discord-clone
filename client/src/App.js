import React from "react";
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

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={startPoint + "/"} component={Login} />
        <Route exact path={startPoint + "/signup"} component={SignUp} />
        {/* <Route exact path="/chat/id=:id" component={Chat} /> */}
        <Route exact path={startPoint + "/chat/:roomId"} component={Chat} />
        <Route exact component={Chat} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
