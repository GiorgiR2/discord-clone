import { HashRouter as Router, Switch, Route } from "react-router-dom"; // BrowserRouter, Switch

import Login from "./pages/Login/Login";
import SignUp from "./pages/Signup/Sign_Up";
import Chat from "./pages/Chat/Chat";

import "./styles/_main.sass";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/signup" component={SignUp} />
        {/* <Route exact path="/chat/id=:id" component={Chat} /> */}
        {/*<Route path="/chat(/:roomId)(/:hash)" component={Chat} />*/}
        <Route path="/chat/:roomId/:hashId" component={Chat} />
        <Route component={Chat} />
      </Switch>
    </Router>
  );
};

export default App;
