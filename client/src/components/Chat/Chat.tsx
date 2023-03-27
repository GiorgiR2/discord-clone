import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useOnClickOutside } from "../customHooks/useOnClickOutside";

import { useParams, useHistory } from "react-router-dom";

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import { clearAll, addUserName } from "../../features/interfaces";
import {
  togglePopupAdd,
  toggleLeft,
  toggleRight,
  closeLeft,
  closeRight,
  toggleSettings,
} from "../../features/toggle";

import { checkRoomId } from "../js/checkData";

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
        className={`categories ${toggleRedux.toggleLeft === false ? "hidden" : ""
          }`}
        ref={contextMenuLeftRef}
      >
        <div className="topl">
          <h1 className="user">{reduxData.currentUser}</h1>
          <img className="x" src={egressSVG} alt="exit" onClick={() => dispatch(toggleLeft())} />
          <img src={settingsSVG} alt="settings" className="settings" onClick={() => dispatch(toggleSettings())} />
        </div>

        <h1 className="plus" onClick={() => dispatch(togglePopupAdd())}>
          add new room <b>+</b>
        </h1>

        <nav>
          <ul id="ul-id">
            <RoomsJSX />
          </ul>
        </nav>
      </div>
    );
  };

  const Center = () => (
    <div className="messages">
      <div id="top">
        <Panel side="left" />
        <h1 id="category"># {reduxData.currentRoom}</h1>
        <h1
          id="log_out"
          onClick={() => {
            logOut(history, dispatch);
          }}
        >
          Log out
        </h1>
        <Panel side="right" />
      </div>

      {reduxData.voiceMode ? <VoiceFrame /> : <Messages />}
    </div>
  );

  const StatusBar = () => {
    const closeRightPanel = (): void => {
      dispatch(closeRight());
    };

    const contextMenuRightRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(contextMenuRightRef, closeRightPanel);

    return (
      <div
        className={`status-bar ${toggleRedux.toggleRight === false ? "hidden" : ""
          }`}
        ref={contextMenuRightRef}
      >
        <div className="top">
          <img
            className="x"
            src={egressSVG}
            alt="exit"
            onClick={() => dispatch(toggleRight())}
          />

          <h1
            className="logOut"
            onClick={() => {
              logOut(history, dispatch);
            }}
          >
            Log out
          </h1>
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
  const scrollToBottom = () => {
    // scroll to the newest message
    try {
      let el: any = document.getElementById("last-element");
      el.scrollIntoView();
    } catch {
      //pass
    }
  }

  const dispatch: AppDispatch = useDispatch();
  const reduxData = useSelector((state: RootState) => state.interfaces.value);
  const voiceRedux = useSelector((state: RootState) => state.voice.value);
  const toggleRedux = useSelector((state: RootState) => state.toggle.value);

  let { roomId, hashId } = useParams<{ roomId: string; hashId: string }>();
  const history = useHistory();

  useLayoutEffect(() => {
    // checkHashId(hashId, history);
    checkRoomId(dispatch, apiLink, roomId, hashId, history);

    getBasicData({ history, roomId, hashId, dispatch });
    scrollToBottom();
  }, []);

  useEffect(() => {
    if (reduxData.currentUser !== "") socks.main(reduxData, dispatch);
  }, [reduxData.currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [reduxData.messages]);

  useEffect(() => {
    if (reduxData.voiceMode && reduxData.currentUser === "") {
      axios
        .post(`${apiLink}/api/users/usernameByHashId`, { hashId: hashId })
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
      {toggleRedux.displayEdit ? <PopupEditRoom /> : null}
      {toggleRedux.displayAdd ? <PopupAddRoom /> : null}
      {toggleRedux.displaySettings ? <PopupSettings /> : null}

      <Rooms />
      <Center />
      <StatusBar />
      {toggleRedux.contextMenu.show ? (
        <DeleteDiv
          x={toggleRedux.contextMenu.x}
          y={toggleRedux.contextMenu.y}
          id={toggleRedux.contextMenu.id}
        />
      ) : null}
    </div>
  );
};

export default Chat;
