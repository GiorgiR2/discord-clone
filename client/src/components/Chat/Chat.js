import React, { useState, useEffect, useReducer, useRef } from "react";

import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import FormData from "form-data";

import getTime from "../js/getTime";

import "./_chat.sass";
import { EditSVG } from "../../styles/SVGs/_SVGs";

import FileDownload from "js-file-download";

import { appendFile } from "./_appendFile";
import { getBasicData } from "../js/_getBasicData";
import * as socks from "../js/_socketSide";

// import { WebRTCFrame } from '../WebRTCInteractive/WebRTCInteractive';
import { VoiceFrame } from "../Voice/_voice";

import { PopupEditCat, PopupAddCat } from "./_editCat";

const apiLink = "http://127.0.0.1:5000";

const checkRoomId = (roomId, setCategory, history, setVoiceMode) => {
  if (roomId === undefined) history.push("/chat/61ed960432479c682956802b");
  // roomId = "61ed960432479c682956802b";

  axios
    .post("/api/roomId", { id: roomId })
    .then((res) => {
      if (res.data.roomName != "try_again") {
        setCategory(res.data.roomName);
        if (res.data.voiceMode) setVoiceMode(true);
      } else {
        history.push("/chat/61ed960432479c682956802b");
        // roomId = "61ed960432479c682956802b";
        setCategory("room 1");
        setVoiceMode(false);
      }
    })
    .catch((err) => console.error(err));
};

const logOut = (e, history) => {
  e.preventDefault();
  axios
    .post("/api/users/logout", { junk: "" })
    .then((res) => {
      if (res.data.status === "done") history.push("/");
    })
    .catch((err) => console.error(err));

  socks.disconnect();
};

const NewMessage = ({ user, msg, date, isFile }) => {
  // msg may be a text / a multiline text or a fileID
  const downloadByURL = (e, linkId) => {
    e.preventDefault();
    axios.post(`/file:${linkId}`, { data: "nothing" }).then((response) => {
      FileDownload(response.data, "report.jpg");
      return;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "file.png"); //or any other extension
      document.body.appendChild(link);
      link.click();
    });
  };

  let link = `${apiLink}/file/${msg}`; // msg === Id

  return (
    <div className="element">
      <div className="author">{user}</div>
      <div className="message">
        {isFile ? (
          <a href={link} target="_blank">
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

const CategoriesJSX = ({ cats, display, setDisplay, setElementId }) =>
  cats.map((cat) => (
    <li className="category" id={cat._id}>
      <a href={`/chat/${cat._id}`}># {cat.name}</a>
      <EditSVG
        id={cat._id}
        display={display}
        setDisplay={setDisplay}
        setElementId={setElementId}
      />
    </li>
  ));

const Chat = () => {
  const Categories = () => (
    // { user, cats, displayEdit, setDisplayEdit, displayAdd, setDisplayAdd, setElementId}
    <div className="categories">
      <div className="top">
        <div className="topbar">
          <h1 className="user">{userName}</h1>
          <h1 className="plus" onClick={() => setDisplayAdd(!displayAdd)}>
            +
          </h1>
        </div>

        <nav>
          <ul id="ul-id">
            <CategoriesJSX
              cats={catjson}
              display={displayEdit}
              setDisplay={setDisplayEdit}
              setElementId={setElementId}
            />
          </ul>
        </nav>
      </div>
    </div>
  );

  const Messages = () => {
    // { authentication, room, roomId, elements, user }
    const handleSubmit = (e) => {
      const sendFileData = () => {
        socks.sendFileData(
          e,
          userName,
          category,
          roomId,
          datetime,
          file.size,
          file.name,
          authentication
        );
      };

      e.preventDefault();

      const url = `${apiLink}/upload`;
      const formData = new FormData();
      const datetime = getTime();

      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("room", category);
      formData.append("user", userName);
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
          if (res === "done") sendFileData();
        })
        .catch((err) => sendFileData());

      // console.log("!!!!!!!!!!", file.name, file.size, typeof file.size);

      // socket send
    };

    const [file, setFile] = useState();

    return (
      <>
        <div id="chat-screen">
          {elements.map((el) => (
            <NewMessage
              user={el.user}
              msg={el.msg}
              date={el.date}
              isFile={el.isFile}
            />
          ))}
          <div id="last-element"></div>
        </div>
        <div id="input">
          <textarea
            id="text-area"
            type="text"
            placeholder={`Message #${category}`}
            onKeyPress={(e) =>
              socks.sendMessage(e, userName, category, roomId, authentication)
            }
          ></textarea>
          {/* <svg viewBox="0 0 24 24" onClick={(event) => appendFile(event)}>
                    <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z">
                    </path>
                </svg> */}
          {/*
            action="/upload"
            method="post"
            encType="multipart/form-data"
										*/}
          <form onSubmit={handleSubmit} className="inputForm">
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <button type="submit">send</button>
          </form>
        </div>
      </>
    );
  };

  const Center = () => (
    <div className="messages">
      <div id="top">
        <h1 id="category"># {category}</h1>
        <h1
          id="log_out"
          onClick={(event) => {
            logOut(event, history);
          }}
        >
          Log out
        </h1>
      </div>

      {voiceMode ? (
        <VoiceFrame history={history} roomId={roomId} userName={userName} />
      ) : (
        <Messages />
      )}
    </div>
  );

  const StatusBar = () => (
    // { online, offline }
    <div className="status-bar">
      <h2>ACTIVE - {onlineList.length}</h2>
      {onlineList.map((el) => (
        <h2 className="online">--- {el}</h2>
      ))}
      <h2>OFFLINE - {offlineList.length}</h2>
      {offlineList.map((el) => (
        <h2 className="offline">--- {el}</h2>
      ))}
    </div>
  );

  const reducer = (state, action) => {
    // pass
  };

  const initialState = {
    setOnline: "",
    setOffline: "",
    onlineList: [],
    offlineList: [],
  };

  const [online, setOnline] = useState("");
  const [offline, setOffline] = useState("");
  const [onlineList, setOnlineList] = useState([]);
  const [offlineList, setOfflineList] = useState([]);

  // const [state, dispatch] = useReducer(reducer, initialState);

  let { roomId } = useParams();

  const [userName, setUserName] = useState("");
  const [category, setCategory] = useState("");

  const [catjson, setCatJson] = useState([]);
  const [authentication, setAuthentication] = useState();

  const [element, setElement] = useState({
    user: "author",
    msg: "message",
    date: "date",
    isFile: false,
  });
  const [elements, setElements] = useState([]);

  const [displayEdit, setDisplayEdit] = useState(false);
  const [displayAdd, setDisplayAdd] = useState(false);
  const [elementId, setElementId] = useState();

  const [voiceMode, setVoiceMode] = useState(false);

  const history = useHistory();

  useEffect(() => {
    checkRoomId(roomId, setCategory, history, setVoiceMode);

    getBasicData(history, setUserName, setAuthentication, setCatJson, "chat");
  }, []);

  useEffect(() => {
    if (userName !== "")
      socks.main(category, userName, setElement, setOnline, setOffline);
  }, [userName]);

  useEffect(() => {
    setElements([...elements, element]);
  }, [element]);

  useEffect(() => {
    let el = document.getElementById("last-element");
    el.scrollIntoView();
  }, [elements]);

  useEffect(() => {
    if (online !== "") {
      let new_offlineList = offlineList.filter((element) => element !== online);
      setOfflineList(new_offlineList);
      setOnlineList([...onlineList, online]);
    }
  }, [online]);

  useEffect(() => {
    if (offline !== "") {
      let new_onlineList = onlineList.filter((element) => element !== offline);
      setOnlineList(new_onlineList);
      setOfflineList([...offlineList, offline]);
    }
  }, [offline]);

  return (
    <div className="chat">
      {displayEdit ? (
        <PopupEditCat
          setDisplay={setDisplayEdit}
          catjson={catjson}
          setCatJson={setCatJson}
          elementId={elementId}
        />
      ) : null}
      {displayAdd ? (
        <PopupAddCat
          setDisplay={setDisplayAdd}
          catjson={catjson}
          setCatJson={setCatJson}
        />
      ) : null}

      <Categories />
      <Center />
      <StatusBar />
    </div>
  );
};

export default Chat;
