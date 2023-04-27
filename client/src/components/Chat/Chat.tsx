import React, { useEffect, useRef } from "react";
import { useOnClickOutside } from "../customHooks/useOnClickOutside";

import { useParams, useHistory } from "react-router-dom";

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import { clearAll, addUserName } from "../../features/interfaces";
import { togglePopupAdd, toggleLeft, toggleRight, closeLeft, closeRight, toggleSettings, toggleRooms } from "../../features/toggle";

import { checkRoomId } from "../js/checkRoomId";

import Panel from "./sidePanel/sidePanel";
import DeleteDiv from "./deleteDiv/deleteDiv";

import "./_chat.sass";

import { getBasicData } from "../../scripts/_getBasicData";
import * as socks from "../../scripts/_socketSide";

import { VoiceFrame } from "./Voice/_voice";
import { voiceMain } from "./Voice/_webRTCfunctions";

import PopupAddRoom from "./popup/_addRoom";
import PopupEditRoom from "./popup/_editRoom";
import RoomsJSX from "./Rooms/_roomsJSX";
import Messages from "./Messages/_messages";

import packageJson from "../../../package.json";

import { userDataI } from "../../types/types";
import { AppDispatch, RootState } from "../..";

import { History } from "history";
import PopupSettings from "./popup/_settings";

const egressSVG: string = require("../../assets/egress.svg").default;
const settingsSVG: string = require("../../assets/chat/settings.svg").default;
const bottomArrow: string = require("../../assets/chat/rooms/bottom_arrow.svg").default;
const logout: string = require("../../assets/chat/logout.svg").default;

const apiLink = packageJson.proxy;

const logOut = (history: History, dispatch: AppDispatch) => {
  // axios
  //   .post(`${apiLink}/api/users/logout`, { junk: "" })
  //   .then((res) => {
  //     if (res.data.status === "done") {
  //       localStorage.removeItem("hashId");
  //       history.push(`/`);
  //       window.location.reload();
  //     }
  //   })
  //   .catch((err) => console.error(err));

  localStorage.removeItem("hashId");
  history.push(`/`);
  dispatch(clearAll());
  socks.disconnect();
};

const Chat: React.FC = () => {
  const Rooms = () => {
    const closeLeftPanel = (): void => {
      dispatch(closeLeft());
    };

    const contextMenuLeftRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(contextMenuLeftRef, closeLeftPanel);

    return (
      <div
        className={`categories ${toggleRedux.toggleLeft === false ? "hidden" : ""}`}
        ref={contextMenuLeftRef}
      >
        <div className="topl">
          <h1 className="user">{reduxData.currentUser}</h1>
          <img className="x" src={egressSVG} alt="exit" onClick={() => dispatch(toggleLeft())} />
          <img src={settingsSVG} title="settings" alt="settings" id="settings" onClick={() => dispatch(toggleSettings())} />
        </div>

        {/* <h1 className="plus" onClick={() => dispatch(togglePopupAdd())}>
          add new room <b>+</b>
        </h1> */}
        <div className="addRoom">
          <div className="left" onClick={() => dispatch(toggleRooms())}>
            <img className={`arrow ${toggleRedux.toggleRooms ? "rotate" : ""}`} src={bottomArrow} alt="exit" onClick={() => dispatch(toggleLeft())} />
            <h4>CHANNELS</h4>
          </div>
          <b id="plus" title="add new room" onClick={() => dispatch(togglePopupAdd())}>+</b>
        </div>

        <RoomsJSX />
      </div>
    );
  };

  const StatusBar = () => {
    const closeRightPanel = (): void => {
      dispatch(closeRight());
    };

    const contextMenuRightRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(contextMenuRightRef, closeRightPanel);

    return (
      <div
        className={`status-bar ${toggleRedux.toggleRight === false ? "hidden" : ""}`}
        ref={contextMenuRightRef}
      >
        <div className="top">
          <img
            className="x"
            src={egressSVG}
            alt="exit"
            onClick={() => dispatch(toggleRight())}
          />

          <LogOut />
        </div>
        <h3 className="titleON">ACTIVE - {reduxData.online.length}</h3>
        {reduxData.online.map((el: string, n: number) => (
          <h3 className="online" key={n}>
            <div />
            {el}
          </h3>
        ))}
        <h3 className="titleOFF">OFFLINE - {reduxData.offline.length}</h3>
        {reduxData.offline.map((el: string, n: number) => (
          <h3 className="offline" key={n}>
            <div />
            {el}
          </h3>
        ))}
      </div>
    );
  };
  const LogOut = () => (
    <img
      className="log_out"
      src={logout}
      alt="exit"
      onClick={() => logOut(history, dispatch)}
      title="log out"
    />
  )
  // const loadMessages = () => {
  //   setTimeout(() => {
  //     if (reduxData.currentUser !== "" && reduxData.currentRoom !== "") {
  //       socks.main(reduxData, dispatch);
  //     }
  //     else {
  //       loadMessages();
  //     }
  //   }, 500);
  // }

  const dispatch: AppDispatch = useDispatch();
  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const voiceRedux = useSelector((state: RootState) => state.voice.value);
  const toggleRedux = useSelector((state: RootState) => state.toggle.value);

  let { roomId, hashId } = useParams<{ roomId: string; hashId: string }>();
  const history = useHistory();

  useEffect(() => {
    document.title = "chat";
    checkRoomId(dispatch, apiLink, roomId, hashId, history);
    getBasicData({ history, roomId, hashId, dispatch });
  }, []);

  // useEffect(() => {
  //   loadMessages();
  // }, [reduxData.currentUser]);

  useEffect(() => {
    if (reduxData.voiceMode && reduxData.currentUser === "") {
      axios
        .get(`${apiLink}/api/users/usernameByHashId/${hashId}`)
        .then((res) => {
          // console.log("res.data.username:", res.data.username);
          dispatch(addUserName({ username: res.data.username }));
          let userData: userDataI = {
            currentRoom: reduxData.currentRoom,
            currentRoomId: reduxData.currentRoomId,
            currentUser: res.data.username,
          };
          voiceMain(voiceRedux, userData, dispatch);
        })
        .catch((err) => console.error(err));
    } else if (reduxData.voiceMode) {
      voiceMain(voiceRedux, reduxData, dispatch);
    }
  }, [reduxData.voiceMode]);

  return (
    <div className="chat">
      {toggleRedux.displayEdit && <PopupEditRoom />}
      {toggleRedux.displayAdd && <PopupAddRoom />}
      {toggleRedux.displaySettings && <PopupSettings />}

      <Rooms />

      {/* center */}
      <div className="messages">
        <div id="top">
          <Panel side="left" />
          <h1 id="category"># {reduxData.currentRoom}</h1>
          <LogOut />
          <Panel side="right" />
        </div>

        {reduxData.voiceMode ? <VoiceFrame /> : <Messages />}
      </div>

      <StatusBar />

      {toggleRedux.contextMenu.show &&
        <DeleteDiv
          x={toggleRedux.contextMenu.x}
          y={toggleRedux.contextMenu.y}
          id={toggleRedux.contextMenu.id}
        />
      }
    </div>
  );
};

export default Chat;
