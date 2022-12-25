import React, { useState, useEffect, useRef } from "react";

import { socket } from "../../scripts/_socketSide";
import { useSelector, useDispatch } from "react-redux";

import { useHistory, useParams } from "react-router-dom";

import MicOff from "../../assets/voice/micOff.svg";
import MicOn from "../../assets/voice/micOn.svg";
import CamOff from "../../assets/voice/camOff.svg";
import CamOn from "../../assets/voice/camOn.svg";
import ScreenShare from "../../assets/voice/screenShare.svg";

// import Peer from "simple-peer";

import { changeMode } from "./_functions";

import "./_voice.sass";

const egress = (history, roomId, hashId) => {
  history.push(`/chat/61ed960432479c682956838e/${hashId}`);
};

const Frame = ({ name, status, videoStream }) => (
  <div className="frame">
    <h4 className="name">{name}:</h4>
    {/* style={{height: 150, width: 100}} */}
    <video className="video" ref={videoStream} autoPlay playsInLine />
    {/*controls*/}
    <h4 className="statusLabel">{status}</h4>
  </div>
);

const VoiceFrame = () => {
  const setLabel = (user, text) => {
    if (user === "current") {
      let newUsers = users;
      newUsers[0][1] = text;
      setUsers([...newUsers]);
    } else {
      //pass
    }
  };

  const reduxData = useSelector((state) => state.users.value);

  const [users, setUsers] = useState([]);

  const [mediaStream, setMediaStream] = useState();
  const videoStreams = [useRef(), useRef()]; // [0] is of current device
  const [mediaData, setMediaData] = useState({ audio: false, video: true });

  useEffect(() => {
    setUsers([...users, [reduxData.currentUser, ""]]);
    // socket.emit("join voice", {
    //     roomId: roomId,
    //     username: username,
    // });

    socket.on("all users", (data) => {
      // pass
    });

    socket.on("user joined", (data) => {
      // pass
    });

    socket.on("new stream", (data) => {
      // pass
    });
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia(mediaData)
      .then((stream) => {
        setMediaStream(stream);
        videoStreams[0].current.srcObject = stream;

        // Todo: set media label to "No Video"
        if (!mediaData.video) setLabel("current", "No Video");
        else setLabel("current", "");
      })
      .catch((err) => {
        try {
          mediaStream.getTracks().forEach((track) => track.stop());
          // Todo: set media label to "No Signal"
          setLabel("current", "No Signal");
        } catch (TypeError) {
          // setLabel("current", "no video");
          // console.log("no shit...");
        }
      });
  }, [mediaData]);

  const history = useHistory();
  let { roomId, hashId } = useParams();

  return (
    <div className="webrtc">
      <div className="windows">
        {users.map((user, n) => (
          <Frame
            name={user[0]}
            status={user[1]}
            videoStream={videoStreams[n]}
          />
        ))}
      </div>

      <div className="bottom">
        <div className="icons">
          <img
            className="svg micon"
            src={mediaData.audio ? MicOn : MicOff}
            onClick={() => changeMode(mediaData, setMediaData, "audio")}
          />
          <img
            className="svg camon"
            src={mediaData.video ? CamOn : CamOff}
            onClick={() => changeMode(mediaData, setMediaData, "video")}
          />
          
          <img className="svg screenon" src={ScreenShare} />
        </div>
        <a
          className="egress"
          onClick={() => {
            history.push(`/chat/61ed960432479c682956838e/${hashId}`);
            window.location.reload();
          }}
        >
          egress
        </a>
        <h4 className="p2p">p2p connection</h4>
      </div>
    </div>
  );
};

const checkMode = (voiceMode, setStatusLabel) => {
  if (!voiceMode) setStatusLabel("invalid");
};

export { VoiceFrame };
