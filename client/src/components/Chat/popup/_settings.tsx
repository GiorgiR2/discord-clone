import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { RootState } from "../../..";

import axios from "axios";
import packageJson from "../../../../package.json";

// @ts-ignore
import bcrypt from 'bcryptjs'

import { toggleSettings } from "../../../features/toggle";
import { checkStatus } from "../../js/passwordStrength";
import InputComponent from "../../Login&Signup/inputComponent/inputComponent";

import "./_popup.sass";
import "./_settings.sass";

const egressSVG: string = require("../../../assets/egress.svg").default;

const apiLink = packageJson.proxy;

const PopupSettings = () => {
    const changePassword = (): void => {
        if (match === "match" && password0.length > 3){
            const hashedPassword = bcrypt.hashSync(password0, '$2a$10$CwTycUXWue0Thq9StjUM0u');

            axios.post(`${apiLink}/api/users/changePassword`, {
                authentication: reduxData.authentication,
                username: reduxData.currentUser,
                password: hashedPassword
            })
            .then(res => {
                if (res.data.status === "done"){
                    alert("password succesfully changed...");
                    setCurrentPassword("");
                    setPassword0("");
                    setPassword1("");
                    dispatch(toggleSettings());
                }
            })
            .catch(err => console.error(err));
        }
        else if (match !== "match"){
            alert("passwords do not match");
        }
        else{
            alert("password is too short");
        }
    }
    const deleteAccount = (): void => {
        axios.delete(`${apiLink}/api/users/deleteAccount`, {
            headers: {
                Authorization: reduxData.authentication
            },
            data: {
                username: reduxData.currentUser
            }
        })
        .then(res => {
            if(res.data.status === "done"){
                alert("user succesfully deleted...");
                localStorage.removeItem("hashId");
                history.push("");
            }
        });
    }

    const history = useHistory();
    
    const dispatch = useDispatch();
    const reduxData = useSelector((state: RootState) => state.interfaces.value);

    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [currentPasswordStatus, setCurrentPasswordStatus] = useState<"" | "correct" | "incorrect">("");

    const [password0, setPassword0] = useState<string>("");
    const [password1, setPassword1] = useState<string>("");

    const [passwordStatus, setPasswordStatus] = useState<"" | "weak" | "normal" | "strong">("");
    const [match, setMatch] = useState<"" | "passwords must match" | "match">("");

    useEffect(() => {
        checkStatus(password0, password1, setPasswordStatus, setMatch);
    }, [password0, password1]);

    return (
        <div className="popup settings">
            <div className="center">
                <div className="main">
                    <h4 className="mainTitle">PROFILE SETTINGS_</h4>
                    <img
                    className="x"
                    src={egressSVG}
                    alt="exit"
                    onClick={() => dispatch(toggleSettings())}
                    />
                </div>

                <div className="changePassword">
                    <h5>Change Password</h5>
                    <div className="signup-password">
                        <InputComponent input={currentPassword} setInput={setCurrentPassword} defaultText="Current Password" type="password" />
                        <h5 className={`${currentPasswordStatus === "correct" ? "display green" : ""}
                                        ${currentPasswordStatus === "incorrect" ? "display red" : ""}`}
                        >{currentPasswordStatus}</h5>
                    </div>
                    <div className="signup-password">
                        <InputComponent input={password0} setInput={setPassword0} defaultText="New Password" type="password" />
                        <h5 className={`${passwordStatus !== "" ? "display" : ""} ${passwordStatus === "strong" ? "green" : ""}`}>{passwordStatus}</h5>
                    </div>
                    <div className="signup-password">
                        <InputComponent input={password1} setInput={setPassword1} defaultText="Repeat password" type="password" />
                        <h5 className={`${match !== "" ? "display" : ""} ${match === "match" ? "green" : ""}`}>{match}</h5>
                    </div>
                </div>

                {/* @ts-ignore */}
                <h5 className="modify" onClick={() => changePassword()}>save</h5>
                <h5 className="delete" onClick={() => deleteAccount()}>Delete Account</h5>
                {/* <h5 className="cancel" onClick={() => dispatch(toggleSettings())}>CLOSE</h5> */}
            </div>
        </div>
    );
};

export default PopupSettings;
