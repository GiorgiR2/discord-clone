import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { RootState } from "../../..";

import axios from "axios";
import packageJson from "../../../../package.json";

import encrypt from "../../../utils/encrypt";

import { toggleSettings } from "../../../features/toggle";
import { checkStatus } from "../../../utils/passwordStrength";
import InputComponent from "../../../components/inputComponent/inputComponent";

import "./_popup.sass";
import "./_settings.sass";
import { socket } from "../../../scripts/_socketSide";

const egressSVG: string = require("../../../assets/egress.svg").default;
const userSVG: string = require("../../../assets/chat/user-flat.svg").default;

const apiLink = packageJson.proxy;

const PopupSettings = () => {
    const changePassword = (): void => {
        if (match === "match" && password0.length > 3) {
            const hashedOldPassword = encrypt(currentPassword);
            const hashedNewPassword = encrypt(password0);

            axios.post(`${apiLink}/api/users/changePassword`, {
                authentication: reduxData.authentication,
                username: reduxData.currentUser,
                oldPassword: hashedOldPassword,
                newPassword: hashedNewPassword
            })
                .then(res => {
                    if (res.data.success) {
                        alert("password succesfully changed...");
                        setCurrentPassword("");
                        setPassword0("");
                        setPassword1("");
                        dispatch(toggleSettings());
                    }
                    else if (res.data.success === false) {
                        alert("wrong password");
                    }
                })
                .catch(err => console.error(err));
        }
        else if (match !== "match") {
            alert("passwords do not match");
        }
        else {
            alert("password is too short");
        }
    }
    const deleteAccount = (): void => {
        axios.post(`${apiLink}/api/users/deleteAccount`, {
            authentication: reduxData.authentication,
            username: reduxData.currentUser
        })
            .then(res => {
                if (res.data.success) {
                    socket.emit("popAccount", { authentication: reduxData.authentication, username: reduxData.currentUser });

                    alert("user succesfully deleted...");
                    localStorage.removeItem("hashId");
                    history.push("");
                }
            });
    }
    const addProfilePicture = (event: any) => {
        const sendToServer = (image: any) => {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("user", reduxData.currentUser);

            const config = {
                headers: {
                    "content-type": "multipart/form-data",
                },
            };
            axios
                .post(`${apiLink}/api/users/addProfilePicture`, formData, config)
                .then(res => console.log(res.status))
                .catch((err) => console.error(err));
        };

        if (event.target.files && event.target.files[0]) {
            let reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicture(URL.createObjectURL(event.target.files[0]));
            };
            reader.readAsDataURL(event.target.files[0]);
            sendToServer(event.target.files[0]);
        }
    }
    const loadProfilePicture = () => {
        axios.get(`${apiLink}/api/users/checkImageAvailability/${reduxData.currentUser}`)
            .then(res => {
                if (res.data.success) {
                    let imgLink = `${apiLink}/api/users/profilePicture/${reduxData.currentUser}`;
                    setProfilePicture(imgLink);
                }
            })
            .catch(err => console.error(err));
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

    const [profilePicture, setProfilePicture] = useState<any>(null);

    useEffect(() => {
        loadProfilePicture();
    }, []);

    useEffect(() => {
        checkStatus(password0, password1, setPasswordStatus, setMatch);
    }, [password0, password1]);

    return (
        <div className="popup settings">
            <div className="center">
                <div className="main">
                    <h4 className="mainTitle">My Account_</h4>
                    <img
                        className="x"
                        src={egressSVG}
                        alt="exit"
                        onClick={() => dispatch(toggleSettings())}
                    />
                </div>

                <div className="profile">
                    <div className="left">
                        <img src={profilePicture || userSVG} alt="user" className="icon" />
                        <h5 className="userName">{reduxData.currentUser}</h5>
                    </div>

                    <div className="right">
                        {/* @ts-ignore */}
                        <label for="addImage" className="submitButton"><h5>Edit Profile Image</h5></label>
                        <input type="file" id="addImage" onChange={(e) => addProfilePicture(e)} />
                    </div>
                </div>

                <div className="newLine" />

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

                <h5 className="submitButton" onClick={() => changePassword()}>done</h5>

                <div className="newLine" />

                <div className="remove">
                    <h5 className="title">ACCOUNT REMOVAL</h5>
                    <h5 className="delete" onClick={() => deleteAccount()}>Delete Account</h5>
                </div>
            </div>
        </div>
    );
};

export default PopupSettings;
