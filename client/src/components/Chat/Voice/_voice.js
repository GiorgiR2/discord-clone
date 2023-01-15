import React, { useState, useEffect, useRef } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setCurrentStatus, setMediaData } from "../../../features/voice";

import {
  socket,
  toggleVideo,
  toggleAudio,
  shareScreen,
} from "./_webRTCfunctions";

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

const launchIntoFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    element.classList.toggle("fullscreen");
  }
};

const Frame = ({ name, status, id }) => {
  // const videoRef = useRef();
  return (
    <div className="frame">
      {/* style={{height: 150, width: 100}} */}
      <video
        className="video"
        id={id}
        autoPlay
        playsInLine
        isFullscreen={true}
      />
      {/*controls*/}
      <h5 className="statusLabel">{status}</h5>
      <div className="bottom">
        <h5 className="name">{name}</h5>
        <div className="icons">
          <img className="speaker" src={Speaker} />

          <img
            className="fullScreen"
            src={FullScreen}
            onClick={() => launchIntoFullscreen(document.getElementById(id))}
          />
        </div>
      </div>
    </div>
  );
};

const VoiceFrame = () => {
  const changeMode = (button) => {
    // "data" should be immutable
    let data = {
      audio: voiceRedux.mediaData.audio,
      video: voiceRedux.mediaData.video,
    };

    if (button === "video") {
      data.video = !voiceRedux.mediaData.video;
      toggleVideo(data.video);

      socket.emit("toggleVideo", {
        status: data.video ? "" : "No Video",
        roomId: userRedux.currentRoomId,
      });

      dispatch(setCurrentStatus({ status: data.video ? "" : "No Video" }));
    } else if (button === "audio") {
      data.audio = !voiceRedux.mediaData.audio;
      toggleAudio(data.audio);

      // socket.emit("toggleAudio", {
      //   on: data.audio,
      //   roomId: userRedux.currentRoomId,
      // });
    }

    dispatch(setMediaData({ data: data }));
  };

  const history = useHistory();

  let { roomId, hashId } = useParams();

  const dispatch = useDispatch();

  const voiceRedux = useSelector((state) => state.voice.value);
  const userRedux = useSelector((state) => state.users.value);

  useEffect(() => {
    // toggleVideo(voiceRedux.mediaData.video);
    // let videoTrack = voiceRedux.localStream
  }, [voiceRedux.mediaData]);

  useEffect(() => {
    document.getElementById("currentVideo").srcObject = voiceRedux.localStream;
    document.getElementById("currentVideo").muted = true;
  }, [voiceRedux.localStream]);

  useEffect(() => {
    // console.log(voiceRedux.remoteStreams);
    voiceRedux.remoteStreams.map((stream) => {
      // console.log("stream:", stream[0], stream[1]);
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
            onClick={() => shareScreen(voiceRedux, dispatch)}
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
