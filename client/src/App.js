import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './components/Login/Login';
import SignUp from './components/Signup/Sign_Up';
import Chat from './components/Chat/Chat';

import './styles/_main.sass';

const App = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/" component={Login} />
                <Route exact path="/signup" component={SignUp} />
                {/* <Route exact path="/chat/id=:id" component={Chat} /> */}
                <Route exact path="/chat/:" component={Chat} />
                <Route exact component={Chat} />
            </Switch>
        </BrowserRouter>
    );
}

export default App;