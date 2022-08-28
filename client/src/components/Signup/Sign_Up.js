import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { getBasicData } from '../js/_getBasicData';
import packageJson from "../../../package.json";

import './_sign-up.sass';

const apiLink = packageJson.proxy;

const sendData = (e, username, password0, password1, history) => {
    e.preventDefault();
    const data = {
        username: username,
        password0: password0,
        password1: password1
    };

    axios.post(`${apiLink}/api/users/register`, data)
    .then(res => {
        console.log("res", res.data);
        if (res.data.data === "done"){
            history.push('/?status=done');
        }
        else
            alert("try again, something went wrong...");
    })
    .catch(err => console.log(err));
}

const SignUp = () => {
    const [username, setUsername] = useState();
    const [password0, setPassword0] = useState();
    const [password1, setPassword1] = useState();

    const history = useHistory();
    // let { signup } = useParams();

    document.title = "sign up";

    useEffect(() => {
        getBasicData(history);
    }, []);

    return (
        <div className="sign-up">
            <h2 className="sign-up-title">sign up</h2>
            <h2 className="username">UserName:</h2>
            <h2 className="password00">Password:</h2>
            <h2 className="password01">Repeat Password:</h2>

            <input type="text"     className="e-name"                  rows="1" cols="15" onChange={(event) => setUsername(event.target.value)}/>
            <input type="password" className="pass0" autoComplete="on" rows="1" cols="15" onChange={(event) => setPassword0(event.target.value)}/>
            <input type="password" className="pass1" autoComplete="on" rows="1" cols="15" onChange={(event) => setPassword1(event.target.value)}/>

            <button className="go-button" onClick={(event) => sendData(event, username, password0, password1, history)}>
                GO
            </button> 

            <a href="/" className="go-back-button">go back</a>

            {/* if error => alert("please repeat password correctly..."); */}
        </div>
    );
}

export default SignUp;