import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";

import axios from "axios";
import FormData from "form-data";
import { useSelector, useDispatch } from "react-redux";

import {
  togglePopupAdd,
  setRoomName,
  setVoiceMode,
  clearAll,
} from "../../features/users";
import { toggleLeft, toggleRight } from "../../features/interface";

import Panel from "../../styles/sidePanel/sidePanel";

import "./_chat.sass";

import getTime from "../js/getTime";
import packageJson from "../../../package.json";
import { getBasicData } from "../js/_getBasicData";
import * as socks from "../js/_socketSide";

// import { WebRTCFrame } from '../WebRTCInteractive/WebRTCInteractive';
import { VoiceFrame } from "../Voice/_voice";
import { PopupEditCat, PopupAddCat } from "./_editCat";
import { EditSVG, TrashSVG } from "../../styles/SVGs/_SVGs";
import egressSVG from "../../icons/egress.svg";

const apiLink = packageJson.proxy;
const startPoint = "";

const logOut = (e, history, dispatch) => {
  e.preventDefault();
  axios
    .post(`${apiLink}/api/users/logout`, { junk: "" })
    .then((res) => {
      if (res.data.status === "done") history.push(`${startPoint}/`);
    })
    .catch((err) => console.error(err));

  dispatch(clearAll());
  socks.disconnect();
};

const NewMessage = ({ user, msg, date, isFile }) => {
  // msg may be a text / a multiline text or a fileID
  let link = `${apiLink}/file/${msg}`; // msg === Id

  return (
    <div className="element">
      <div className="author">{user}</div>
      <div className="message">
        {isFile ? (
          <a href={link} rel="noreferrer" target="_blank">
            {link}
          </a>
        ) : (
          msg.split("\n").map((line) => <div>{line}</div>)
        )}
      </div>
      <div className="date">{date}</div>
    </div>
  );
};

const Chat = () => {
  const checkRoomId = (roomId, history) => {
    if (roomId === undefined)
      history.push(`${startPoint}/chat/61ed960432479c682956802b`); // roomId = "61ed960432479c682956802b";

    axios
      .post(`${apiLink}/api/roomId`, { id: roomId })
      .then((res) => {
        if (res.data.roomName !== "try_again") {
          dispatch(setRoomName({ name: res.data.roomName }));
          if (res.data.voiceMode) dispatch(setVoiceMode({ bool: true }));
        } else {
          history.push(`${startPoint}/chat/61ed960432479c682956802b`); // roomId = "61ed960432479c682956802b";
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
          <a href={`/chat/${room._id}`}># {room.name}</a>
          <div className="svgs">
            <EditSVG id={room._id} /> {/* set redux editingCatId as id */}
            <TrashSVG id={room._id} />
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

      if (window.innerWidth <= 800) {
        socks.sendMessage(e, reduxData, roomId, "mobile", inputRef);
        return;
      } else if (file === undefined) return;

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
          console.log("file send, res:", res.data);
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
          {reduxData.messages.map((el) => (
            <NewMessage user={el[0]} msg={el[1]} date={el[2]} isFile={el[3]} />
          ))}
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
      <img
        className="x"
        src={egressSVG}
        alt="exit"
        onClick={() => dispatch(toggleRight())}
      />
      <h2>ACTIVE - {reduxData.online.length}</h2>
      {reduxData.online.map((el) => (
        <h2 className="online">--- {el}</h2>
      ))}
      <h2>OFFLINE - {reduxData.offline.length}</h2>
      {reduxData.offline.map((el) => (
        <h2 className="offline">--- {el}</h2>
      ))}
    </div>
  );

  // redux
  const dispatch = useDispatch();
  const reduxData = useSelector((state) => state.users.value);
  const interfacesRedux = useSelector((state) => state.interfaces.value);

  let { roomId } = useParams();
  const history = useHistory();

  useLayoutEffect(() => {
    checkRoomId(roomId, history);

    getBasicData(history, dispatch, "chat");
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
    </div>
  );
};

export default Chat;
