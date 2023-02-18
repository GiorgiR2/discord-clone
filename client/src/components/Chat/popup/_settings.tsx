import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { toggleSettings } from "../../../features/toggle";
import { checkStatus } from "../../js/passwordStrength";
import InputComponent from "../../Login&Signup/inputComponent/inputComponent";

import "./_popup.sass";
import "./_settings.sass";

const changePassword = (match: string, password: string, setCurrentPasswordStatus: any): void => {
    alert("function not available");
}

const PopupSettings = () => {
    const dispatch = useDispatch();

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
                <h4 className="mainTitle">PROFILE SETTINGS_</h4>

                <div className="changePassword">
                    <h5>Change Password</h5>
                    <div className="signup-password">
                        <InputComponent input={currentPassword} setInput={setCurrentPassword} defaultText="Current Password" type="password" />
                        <h5 className={`${currentPasswordStatus === "correct" ? "display green" : ""}
                                        ${currentPasswordStatus === "incorrect" ? "display red" : ""}`}
                        >{currentPasswordStatus}</h5>
                    </div>
                    <div className="signup-password">
                        <InputComponent input={password0} setInput={setPassword0} defaultText="Password" type="password" />
                        <h5 className={`${passwordStatus !== "" ? "display" : ""} ${passwordStatus === "strong" ? "green" : ""}`}>{passwordStatus}</h5>
                    </div>
                    <div className="signup-password">
                        <InputComponent input={password1} setInput={setPassword1} defaultText="Repeat password" type="password" />
                        <h5 className={`${match !== "" ? "display" : ""} ${match === "match" ? "green" : ""}`}>{match}</h5>
                    </div>
                </div>

                {/* @ts-ignore */}
                <h5 className="modify" onClick={() => changePassword(match, password0, setCurrentPasswordStatus)}>save</h5>
                <h5 className="delete">Delete Account</h5>
                <h5 className="cancel" onClick={() => dispatch(toggleSettings())}>CLOSE</h5>
            </div>
        </div>
    );
};

export default PopupSettings;
