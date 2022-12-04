import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom"; // BrowserRouter, Switch

import Login from "./components/Login/Login";
import SignUp from "./components/Signup/Sign_Up";
import Chat from "./components/Chat/Chat";

import "./styles/_main.sass";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/signup" component={SignUp} />
        {/* <Route exact path="/chat/id=:id" component={Chat} /> */}
        <Route path="/chat/:roomId" component={Chat} />
        <Route component={Chat} />
      </Switch>
    </Router>
  );
};

export default App;
