import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useHistory, Link } from "react-router-dom";

import axios from "axios";
import FormData from "form-data";
import { useSelector, useDispatch } from "react-redux";

import {
  togglePopupAdd,
  clearAll,
  addUserName,
  exitEditMode,
  editMessage,
} from "../../features/users";
import {
  toggleLeft,
  toggleRight,
  setContextMenu,
} from "../../features/interface";

import { checkRoomId } from "../js/checkData";

import Panel from "../../styles/sidePanel/sidePanel";
import DeleteDiv from "./deleteDiv/deleteDiv";

import "./_chat.sass";

import getTime from "../../scripts/getTime";
import packageJson from "../../../package.json";
import { getBasicData } from "../../scripts/_getBasicData";
import * as socks from "../../scripts/_socketSide";

import { VoiceFrame } from "./Voice/_voice";
import { voiceMain } from "./Voice/_webRTCfunctions";

import { PopupEditCat, PopupAddCat } from "./editCategory/_editCat";
import { EditSVG, TrashSVG } from "../../styles/SVGs/_SVGs";
import egressSVG from "../../assets/egress.svg";
import sendSVG from "../../assets/send-24px.svg";
import fileSVG from "../../assets/fileIcon.svg";

import userSVG from "../../assets/chat/user-flat.svg";

const apiLink = packageJson.proxy;

const logOut = (e, history, dispatch) => {
  e.preventDefault();
  axios
    .post(`${apiLink}/api/users/logout`, { junk: "" })
    .then((res) => {
      if (res.data.status === "done") {
        localStorage.removeItem("hashId");
        history.push(`/`);
      }
    })
    .catch((err) => console.error(err));

  dispatch(clearAll());
  socks.disconnect();
};

// user, msg, date, isFile, originalName, id, editMode,
const MessagesDivs = ({ reduxData }) => {
  const handleContextMenu = (e, id) => {
    e.preventDefault();

    const { pageX, pageY } = e;
    dispatch(
      setContextMenu({
        contextMenu: { show: true, x: pageX, y: pageY, id: id },
      })
    );
  };
  const handleOnInput = (event, id) => {
    // console.log("OnInput:", event.target.innerHTML, id);
  };
  const handleOnBlur = (event, id) => {
    //Todo: get p content, update that specific line and then send post request
    // console.log("OnBlur");
    dispatch(editMessage({ messageHTML: event.target.innerHTML, _id: id }));
    dispatch(exitEditMode({ _id: id }));
    socks.editMessage(event.target.innerHTML, id);
  };

  const dispatch = useDispatch();

  return reduxData.messages.map((el) => {
    // msg may be a text / a multiline text or a fileID
    let link = `${apiLink}/file/${el.message}`; // msg === Id
    // console.log(el.message);
    return (
      <div
        className={`element messageDiv ${el.editMode ? "focus" : null}`}
        onContextMenu={(event) => handleContextMenu(event, el.id)}
      >
        <img src={userSVG} />
        <div className="main">
          <div className="top">
            <div className="author">
              {el.username} <span>{el.date}</span>
            </div>
            {/*<h4 className="encryption">No Encryption</h4>*/}
          </div>
          <div className="message">
            {el.isFile ? (
              <div className="fileDiv">
                <img src={fileSVG} className="fileSVG" />
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
                onInput={(event) => handleOnInput(event, el.id)}
                onBlur={(event) => handleOnBlur(event, el.id)}
                contentEditable={el.editMode}
              >
                {el.message.split("\n").map((line) => (
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
  });
};

const Chat = () => {
  const Categories = () => {
    const CategoriesJSX = () =>
      reduxData.rooms.map((room) => (
        <li className="category" id={room._id}>
          <a
            className="hyperlink"
            onClick={() => {
              history.push(`/chat/${room._id}/${hashId}`);
              window.location.reload();
            }}
          >
            # {room.name}
          </a>
          {/* <Link to={`/chat/${room._id}`}>
            # {room.name}
          </Link> */}
          <div className="svgs">
            <EditSVG id={room._id} typeE="room" />{" "}
            {/* set redux editingCatId as id */}
            <TrashSVG id={room._id} typeE="room" />
          </div>
        </li>
      ));

    return (
      <div
        className={`categories ${
          interfacesRedux.toggleLeft === false ? "hidden" : ""
        }`}
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
              <CategoriesJSX />
            </ul>
          </nav>
        </div>
      </div>
    );
  };

  const Messages = () => {
    const handleSubmit = (e, file) => {
      const sendFileData = () => {
        socks.sendFileData(
          e,
          reduxData,
          roomId,
          datetime,
          file.size,
          file.name
        );
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

    const [file, setFile] = useState();
    const inputRef = useRef(null); // inputRef.current.value

    return (
      <>
        <div id="chat-screen">
          <MessagesDivs reduxData={reduxData} />
          <div id="last-element"></div>
        </div>
        <div id="input">
          <textarea
            id="text-area"
            type="text"
            placeholder={`Message #${reduxData.currentRoom}`}
            ref={inputRef}
            onKeyPress={(e) =>
              socks.sendMessage(e, reduxData, roomId, "desktop", inputRef)
            }
            autoFocus={window.innerWidth <= 850 ? false : true}
          ></textarea>
          <form
            onSubmit={(event) => handleSubmit(event, file)}
            className="inputForm"
          >
            <input
              type="file"
              id="file"
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
              socks.sendMessage(event, reduxData, roomId, "mobile", inputRef)
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

  const StatusBar = () => (
    // { online, offline }
    <div
      className={`status-bar ${
        interfacesRedux.toggleRight === false ? "hidden" : ""
      }`}
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
      {reduxData.online.map((el) => (
        <h3 className="online">
          <div />
          {el}
        </h3>
      ))}
      <h3 className="titleOFF">OFFLINE - {reduxData.offline.length}</h3>
      {reduxData.offline.map((el) => (
        <h3 className="offline">
          <div />
          {el}
        </h3>
      ))}
    </div>
  );

  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.users.value);
  const voiceRedux = useSelector((state) => state.voice.value);
  const interfacesRedux = useSelector((state) => state.interfaces.value);

  let { roomId, hashId } = useParams();
  const history = useHistory();

  useLayoutEffect(() => {
    // checkHashId(hashId, history);
    checkRoomId(dispatch, apiLink, roomId, hashId, history);

    getBasicData(history, roomId, hashId, dispatch, "chat");
  }, []);

  useEffect(() => {
    if (reduxData.currentUser !== "") socks.main(reduxData, dispatch);
  }, [reduxData.currentUser]);

  useEffect(() => {
    // scroll to the newest message
    try {
      let el = document.getElementById("last-element");
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
          let userData = {
            currentRoom: reduxData.currentRoom,
            currentRoomId: reduxData.currentRoomId,
            currentUser: res.data.username,
          };
          voiceMain(voiceRedux, userData, dispatch);
        })
        .catch((err) => console.error(err));
    } else if (reduxData.voiceMode) {
      // console.log(
      //   `reduxData:
      //   "${reduxData.currentRoom}",
      //   "${reduxData.currentRoomId}",
      //   "${reduxData.currentUser === ""}"
      //   "${hashId}"`
      // );
      voiceMain(voiceRedux, reduxData, dispatch);
    }
  }, [reduxData.voiceMode]);

  return (
    <div className="chat">
      {reduxData.displayEdit ? <PopupEditCat /> : null}
      {reduxData.displayAdd ? <PopupAddCat /> : null}

      <Categories />
      <Center />
      <StatusBar />
      {interfacesRedux.contextMenu.show ? (
        <DeleteDiv
          x={interfacesRedux.contextMenu.x}
          y={interfacesRedux.contextMenu.y}
          id={interfacesRedux.contextMenu.id}
        />
      ) : null}
    </div>
  );
};

export default Chat;
