import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useHistory, Link } from "react-router-dom";

import axios from "axios";
import FormData from "form-data";
import { useSelector, useDispatch } from "react-redux";

import {
  togglePopupAdd,
  setRoomName,
  setVoiceMode,
  clearAll,
} from "../../features/users";
import {
  toggleLeft,
  toggleRight,
  setContextMenu,
} from "../../features/interface";

import Panel from "../../styles/sidePanel/sidePanel";
import DeleteDiv from "./deleteDiv/deleteDiv";

import "./_chat.sass";

import getTime from "../../scripts/getTime";
import packageJson from "../../../package.json";
import { getBasicData } from "../../scripts/_getBasicData";
import * as socks from "../../scripts/_socketSide";

// import { WebRTCFrame } from '../WebRTCInteractive/WebRTCInteractive';
import { VoiceFrame } from "../Voice/_voice";
import { PopupEditCat, PopupAddCat } from "./editCategory/_editCat";
import { EditSVG, TrashSVG } from "../../styles/SVGs/_SVGs";
import egressSVG from "../../assets/egress.svg";
import sendSVG from "../../assets/send-24px.svg";
import fileSVG from "../../assets/fileIcon.svg";

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
  const handleOnInput = (event) => {
    //pass
  };
  const handleOnBlur = (event, id) => {
    //Todo: get p content, update that specific line and then send post request
  };

  const dispatch = useDispatch();

  return reduxData.messages.map((el) => {
    // msg may be a text / a multiline text or a fileID
    let link = `${apiLink}/file/${el[1]}`; // msg === Id

    return (
      <div
        className="element messageDiv"
        onContextMenu={(event) => handleContextMenu(event, el[5])}
      >
        <div className="author">{el[0]}</div>
        <div className="message">
          {el[3] ? (
            <div className="fileDiv">
              <img src={fileSVG} className="fileSVG" />
              <a href={link} rel="noreferrer" target="_blank" className="name">
                {el[4]}
              </a>
            </div>
          ) : (
            el[1].split("\n").map((line) => (
              <p
                onInput={(event) => handleOnInput(event)}
                onBlur={(event) => handleOnBlur(event, el[5])}
                contentEditable={el[6]}
              >
                {line}
              </p>
            ))
          )}
        </div>
        <div className="date">{el[2]}</div>
      </div>
    );
  });
};

const Chat = () => {
  const checkHashId = (hashId, history) => {
    return;
    if (hashId !== undefined) {
      axios
        .post(`${apiLink}/api/users/hashId`, { hashId: hashId })
        .then((res) => {
          if (res.data.status !== "success") {
            history.push("/");
          }
        });
    } else {
      history.push("/");
    }
  };
  const checkRoomId = (roomId, hashId, history) => {
    if (roomId === undefined || hashId === undefined)
      history.push(`/chat/61ed960432479c682956802b/${hashId}`); // roomId = "61ed960432479c682956802b";

    axios
      .post(`${apiLink}/api/roomId`, { id: roomId })
      .then((res) => {
        if (res.data.roomName !== "try_again") {
          dispatch(setRoomName({ name: res.data.roomName }));
          if (res.data.voiceMode) dispatch(setVoiceMode({ bool: true }));
        } else {
          history.push(`/chat/61ed960432479c682956802b/${hashId}`); // roomId = "61ed960432479c682956802b";
          dispatch(setRoomName({ name: "room 1" }));
          dispatch(setVoiceMode({ bool: false }));
        }
      })
      .catch((err) => console.error(err));
  };

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
    const handleSubmit = (e) => {
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
          console.log("send file; res:", res.data);
          if (res.data === "done") sendFileData();
        })
        .catch((err) => sendFileData());

      // console.log("!!!!!!!!!!", file.name, file.size, typeof file.size);

      // socket send
    };

    const [file, setFile] = useState();
    const inputRef = useRef(null); // inputRef.current.value

    return (
      <>
        <div id="chat-screen">
          <div className="element">
            <div className="author">user</div>
            <div className="message">message</div>
            <div className="date">
              <div>date</div>
            </div>
          </div>
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
            autoFocus
          ></textarea>
          <form onSubmit={handleSubmit} className="inputForm">
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

  // redux
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.users.value);
  const interfacesRedux = useSelector((state) => state.interfaces.value);

  let { roomId, hashId } = useParams();
  const history = useHistory();

  useLayoutEffect(() => {
    checkHashId(hashId, history);
    checkRoomId(roomId, hashId, history);
    console.log("roomId:", roomId);
    console.log("hashId:", hashId);

    getBasicData(history, roomId, hashId, dispatch, "chat");
  }, []);

  useEffect(() => {
    if (reduxData.currentUser !== "") socks.main(reduxData, dispatch);
  }, [reduxData.currentUser]);

  useEffect(() => {
    try {
      let el = document.getElementById("last-element");
      el.scrollIntoView();
    } catch {
      //pass
    }
  }, [reduxData.messages]);

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
