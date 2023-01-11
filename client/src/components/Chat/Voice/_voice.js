import React, { useState, useEffect, useRef } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setMediaData } from "../../../features/voice";

import { useHistory, useParams } from "react-router-dom";

import MicOff from "../../../assets/voice/micOff.svg";
import MicOn from "../../../assets/voice/micOn.svg";
import CamOff from "../../../assets/voice/camOff.svg";
import CamOn from "../../../assets/voice/camOn.svg";
import ScreenShare from "../../../assets/voice/screenShare.svg";

import Speaker from "../../../assets/volume_up_black_24dp.svg";
import FullScreen from "../../../assets/fullscreen_black_24dp.svg";

import "./_voice.sass";

const egress = (history, roomId, hashId) => {
  history.push(`/chat/61ed960432479c682956838e/${hashId}`);
};

const Frame = ({ name, status, id }) => {
  // const videoRef = useRef();
  return (
    <div className="frame">
      {/* style={{height: 150, width: 100}} */}
      <video className="video" id={id} autoPlay playsInLine />
      {/*controls*/}
      <h5 className="statusLabel">{status}</h5>
      <div className="bottom">
        <h5 className="name">{name}</h5>
        <div className="icons">
          <img className="speaker" src={Speaker} />

          <img className="fullScreen" src={FullScreen} />
        </div>
      </div>
    </div>
  );
};

const VoiceFrame = () => {
  const changeMode = (button) => {
    // "data" should be immutable (send a new array each time)
    let data = {
      audio: voiceRedux.mediaData.audio,
      video: voiceRedux.mediaData.video,
    };

    if (button === "video") {
      data.video = !voiceRedux.mediaData.video;
    } else if (button === "audio") {
      data.audio = !voiceRedux.mediaData.audio;
    }

    dispatch(setMediaData(data));
  };

  const dispatch = useDispatch();
  const history = useHistory();
  let { roomId, hashId } = useParams();

  const voiceRedux = useSelector((state) => state.voice.value);
  const userRedux = useSelector((state) => state.users.value);

  // const localStream = useRef();

  useEffect(() => {
    // navigator.mediaDevices
    //   .getUserMedia(mediaData)
    //   .then((stream) => {
    //     localStream.current = stream;
    //     document.getElementById("currentVideo").srcObject = localStream.current;
    //     if (!mediaData.video) {
    //       setCurrentUserL([reduxData.currentUser, "No Video"]);
    //     } else setCurrentUserL([reduxData.currentUser, ""]);
    //   })
    //   .catch((err) => {
    //     localStream.current.getTracks().forEach((track) => track.stop());
    //     setCurrentUserL([reduxData.currentUser, "No Video"]);
    //   });
  }, [voiceRedux.mediaData]);

  useEffect(() => {
    document.getElementById("currentVideo").srcObject = voiceRedux.localStream;
  }, [voiceRedux.localStream]);

  useEffect(() => {
    console.log(voiceRedux.remoteStreams);
    voiceRedux.remoteStreams.map((stream) => {
      console.log("stream:", stream[0], stream[1]);
      document.getElementById(stream[0]).srcObject = stream[1];
    });
  }, [voiceRedux.remoteStreams]);

  return (
    <div className="webrtc">
      <div className="windows">
        <Frame
          name={userRedux.currentUser}
          status={voiceRedux.currentStatus}
          id="currentVideo"
        />
        {voiceRedux.remoteUsers.map((user) => (
          <Frame name={user.username} status={user.status} id={user.from} />
        ))}
      </div>

      <div className="bottom">
        <div className="icons">
          <img
            className="svg micon"
            src={voiceRedux.mediaData.audio ? MicOn : MicOff}
            onClick={() => changeMode("audio")}
            title="microphone"
          />
          <img
            className="svg camon"
            src={voiceRedux.mediaData.video ? CamOn : CamOff}
            onClick={() => changeMode("video")}
            title="video cam"
          />

          <img
            className="svg screenon"
            src={ScreenShare}
            title="share screen"
          />
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

export { VoiceFrame };
