import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useOnClickOutside } from "../customHooks/useOnClickOutside";

import { useParams, useHistory } from "react-router-dom";

import axios from "axios";
import FormData from "form-data";
import { useSelector, useDispatch } from "react-redux";

import {
  clearAll,
  addUserName,
  exitEditMode,
  editMessage,
} from "../../features/interfaces";
import {
  togglePopupAdd,
  toggleLeft,
  toggleRight,
  setContextMenu,
  closeLeft,
  closeRight
} from "../../features/toggle";

import { checkRoomId } from "../js/checkData";

import Panel from "./sidePanel/sidePanel";
import DeleteDiv from "./deleteDiv/deleteDiv";

import "./_chat.sass";

import getTime from "../../scripts/getTime";
import { getBasicData } from "../../scripts/_getBasicData";
import * as socks from "../../scripts/_socketSide";

import { VoiceFrame } from "./Voice/_voice";
import { voiceMain } from "./Voice/_webRTCfunctions";

import { PopupEditRoom, PopupAddRoom } from "./Rooms/_editRoom";
import RoomsJSX from "./Rooms/_roomsJSX";

import packageJson from "../../../package.json";

import {
  messageI,
  interfaceInitialStateValueI,
  userDataI,
} from "../../types/types";
import { AppDispatch, RootState } from "../..";

import { History } from "history";

// import egressSVG from "-!svg-react-loader!../../assets/egress.svg";
// import sendSVG from "-!svg-react-loader!../../assets/send-24px.svg";
// import fileSVG from "-!svg-react-loader!../../assets/fileIcon.svg";
// import userSVG from "-!svg-react-loader!../../assets/chat/user-flat.svg";

const egressSVG: string = require("../../assets/egress.svg").default;
const sendSVG: string = require("../../assets/send-24px.svg").default;
const fileSVG: string = require("../../assets/fileIcon.svg").default;
const userSVG: string = require("../../assets/chat/user-flat.svg").default;

const apiLink = packageJson.proxy;

const logOut = (
  e: React.MouseEvent<HTMLHeadingElement, MouseEvent>,
  history: History,
  dispatch: AppDispatch
) => {
  e.preventDefault();
  axios
    .post(`${apiLink}/api/users/logout`, { junk: "" })
    .then((res) => {
      if (res.data.status === "done") {
        localStorage.removeItem("hashId");
        history.push(`/`);
        window.location.reload();
      }
    })
    .catch((err) => console.error(err));

  dispatch(clearAll());
  socks.disconnect();
};

const MessagesDivs = ({
  reduxData,
}: {
  reduxData: interfaceInitialStateValueI;
}): JSX.Element => {
  const handleContextMenu = (e: any, id: string) => {
    e.preventDefault();

    const { pageX, pageY } = e;
    dispatch(
      setContextMenu({
        contextMenu: { show: true, x: pageX, y: pageY, id: id },
      })
    );
  };
  const handleOnInput = (event: any, id: string) => {
    // console.log("OnInput:", event.target.innerHTML, id);
  };
  const handleOnBlur = (event: any, id: string) => {
    //Todo: get p content, update that specific line and then send post request
    // console.log("OnBlur");
    dispatch(editMessage({ messageHTML: event.target.innerHTML, _id: id }));
    dispatch(exitEditMode({ _id: id }));
    socks.editMessage(event.target.innerHTML, id);
  };

  const dispatch = useDispatch();

  return (
    <>
      {reduxData.messages.map((el: messageI) => {
        // msg may be a text / a multiline text or a fileID
        let link = `${apiLink}/file/${el.message}`; // msg === Id
        // console.log(el.message);
        return (
          <div
            className={`element messageDiv ${el.editMode ? "focus" : null}`}
            onContextMenu={(event) => handleContextMenu(event, el._id)}
          >
            <img src={userSVG} alt="user" />
            <div className="main">
              <div className="top">
                <div className="author">
                  {el.user} <span>{el.date}</span>
                  {el.edited ? <span>(edited)</span> : null}
                </div>
                {/*<h4 className="encryption">No Encryption</h4>*/}
              </div>
              <div className="message">
                {el.isFile ? (
                  <div className="fileDiv">
                    <img src={fileSVG} className="fileSVG" alt="file" />
                    <a
                      href={link}
                      rel="noreferrer"
                      target="_blank"
                      className="name"
                    >
                      {el.fileName}
                    </a>
                  </div>
                ) : (
                  <p
                    onInput={(event) => handleOnInput(event, el._id)}
                    onBlur={(event) => handleOnBlur(event, el._id)}
                    contentEditable={el.editMode}
                  >
                    {el.message.split("\n").map((line: string) => (
                      <>
                        {line}
                        <br />
                      </>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
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
        className={`categories ${
          toggleRedux.toggleLeft === false ? "hidden" : ""
        }`}
        ref={contextMenuLeftRef}
      >
        <div className="top">
          <div className="topl">
            <h1 className="user">{reduxData.currentUser}</h1>
            <img
              className="x"
              src={egressSVG}
              alt="exit"
              onClick={() => dispatch(toggleLeft())}
            />
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
      </div>
    );
  };

  const Messages = () => {
    // type fileT = FileList | null;
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, file: any) => {
      const sendFileData = () => {
        socks.sendFileData({
          reduxData,
          roomId,
          datetime,
          size: file.size,
          filename: file.name,
        });
      };

      e.preventDefault();

      // if (window.innerWidth <= 800) {
      //   socks.sendMessage(e, reduxData, roomId, "mobile", inputRef);
      //   return;
      // }
      if (file === undefined) return;

      const url = `${apiLink}/upload`;
      const formData = new FormData();
      const datetime = getTime();

      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("room", reduxData.currentRoom);
      formData.append("user", reduxData.currentUser);
      formData.append("roomId", roomId);
      formData.append("datetime", datetime);
      formData.append("size", file.size);

      const config = {
        headers: {
          "content-type": "multipart/form-data",
        },
      };

      axios
        .post(url, formData, config)
        .then((res) => {
          // console.log("send file; res:", res.data);
          if (res.data === "done") sendFileData();
        })
        .catch((err) => sendFileData());

      // console.log("!!!!!!!!!!", file.name, file.size, typeof file.size);
    };

    const [file, setFile] = useState<any>();
    const inputRef = useRef<HTMLTextAreaElement>(null);

    return (
      <>
        <div id="chat-screen">
          <MessagesDivs reduxData={reduxData} />
          <div id="last-element"></div>
        </div>
        <div id="input">
          <textarea
            id="text-area"
            placeholder={`Message #${reduxData.currentRoom}`}
            ref={inputRef}
            onKeyPress={(event) =>
              socks.sendMessage({
                event,
                reduxData,
                roomId,
                device: "desktop",
                inputRef,
              })
            }
            autoFocus={window.innerWidth <= 850 ? false : true}
          ></textarea>
          <form
            onSubmit={(event) => handleSubmit(event, file)}
            className="inputForm"
          >
            <input
              type="file"
              id="file" // @ts-expect-error
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className="submit" type="submit">
              send
            </button>
          </form>
          <img
            className="send"
            src={sendSVG}
            alt="send"
            onClick={(event) =>
              socks.sendMessage({
                event,
                reduxData,
                roomId,
                device: "mobile",
                inputRef,
              })
            }
          />
        </div>
      </>
    );
  };

  const Center = () => (
    <div className="messages">
      <div id="top">
        <Panel side="left" />
        <h1 id="category"># {reduxData.currentRoom}</h1>
        <h1
          id="log_out"
          onClick={(event) => {
            logOut(event, history, dispatch);
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

    return(
      <div
        className={`status-bar ${
          toggleRedux.toggleRight === false ? "hidden" : ""
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
            onClick={(event) => {
              logOut(event, history, dispatch);
            }}
          >
            Log out
          </h1>
        </div>
        <h3 className="titleON">ACTIVE - {reduxData.online.length}</h3>
        {reduxData.online.map((el: string) => (
          <h3 className="online">
            <div />
            {el}
          </h3>
        ))}
        <h3 className="titleOFF">OFFLINE - {reduxData.offline.length}</h3>
        {reduxData.offline.map((el: string) => (
          <h3 className="offline">
            <div />
            {el}
          </h3>
        ))}
      </div>
    );
  };

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
  }, []);

  useEffect(() => {
    if (reduxData.currentUser !== "") socks.main(reduxData, dispatch);
  }, [reduxData.currentUser]);

  useEffect(() => {
    // scroll to the newest message
    try {
      let el: any = document.getElementById("last-element");
      el.scrollIntoView();
    } catch {
      //pass
    }
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
