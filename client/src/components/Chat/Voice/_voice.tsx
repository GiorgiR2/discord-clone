import { useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setCurrentStatus, setMediaData, setScreenSharing } from "../../../features/voice";

import { socket, toggleVideo, toggleAudio, shareScreen } from "./_webRTCfunctions";

import { useHistory, useParams } from "react-router-dom";

import { frameI } from "../../../types/types";

import "./_voice.sass";
import { RootState } from "../../..";

const MicOff: string = require("../../../assets/voice/micOff.svg").default;
const MicOn: string = require("../../../assets/voice/micOn.svg").default;
const CamOff: string = require("../../../assets/voice/camOff.svg").default;
const CamOn: string = require("../../../assets/voice/camOn.svg").default;
const ScreenShare: string = require("../../../assets/voice/screenShare.svg").default;

const Speaker: string = require("../../../assets/volume_up_black_24dp.svg").default;
const FullScreen: string = require("../../../assets/fullscreen_black_24dp.svg").default;
const EndCall: string = require("../../../assets/voice/phone-call.svg").default;

const launchIntoFullscreen = (element: any): void => {
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

const Frame = ({ user, status, from }: frameI) => {
  // const videoRef = useRef();
  return (
    <div className="frame">
      {/* style={{height: 150, width: 100}} */}
      <video
        className="video"
        id={from}
        autoPlay // @ts-expect-error
        playsInLine
        isFullscreen={true}
      />
      {/*controls*/}
      <h5 className="statusLabel">{status}</h5>
      <div className="bottom">
        <h5 className="name">{user}</h5>
        <div className="icons">
          <img className="speaker" src={Speaker} alt="speaker" />

          <img
            className="fullScreen"
            src={FullScreen}
            onClick={() => launchIntoFullscreen(document.getElementById(from))}
            alt="fullscreen"
          />
        </div>
      </div>
    </div>
  );
};

const VoiceFrame = () => {
  const changeMode = (button: "audio" | "video") => {
    // "data" should be immutable
    let data = {
      audio: voiceRedux.mediaData.audio,
      video: voiceRedux.mediaData.video,
    };

    if (button === "video") {
      data.video = !voiceRedux.mediaData.video;
      toggleVideo(voiceRedux, dispatch, data.video);

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

  let { _, hashId } = useParams<{ _: string; hashId: string; }>();

  const dispatch = useDispatch();

  const voiceRedux = useSelector((state: RootState) => state.voice.value);
  const userRedux = useSelector((state: RootState) => state.interfaces.value);

  useEffect(() => {
    // toggleVideo(voiceRedux.mediaData.video);
    // let videoTrack = voiceRedux.localStream
  }, [voiceRedux.mediaData]);

  useEffect(() => {
    // @ts-expect-error
    document.getElementById("currentVideo").srcObject = voiceRedux.localStream;
    // @ts-expect-error
    document.getElementById("currentVideo").muted = true;
  }, [voiceRedux.localStream]);

  useEffect(() => {
    // console.log(voiceRedux.remoteStreams);
    voiceRedux.remoteStreams.map((stream) => {
      // console.log("stream:", stream[0], stream[1]);
      // @ts-expect-error
      document.getElementById(stream[0]).srcObject = stream[1];
    });
  }, [voiceRedux.remoteStreams]);

  return (
    <div className="webrtc">
      <div className="windows">
        <Frame
          user={userRedux.currentUser}
          status={voiceRedux.currentStatus}
          from="currentVideo"
        />
        {voiceRedux.remoteUsers.map((user) => (
          <Frame user={user.user} status={user.status} from={user.from} />
        ))}
      </div>

      <div className="bottom">
        <div className="icons">
          <img
            className="svg mic"
            src={voiceRedux.mediaData.audio ? MicOn : MicOff}
            onClick={() => changeMode("audio")}
            title="microphone"
            alt="mic"
          />
          <img
            className="svg cam"
            src={voiceRedux.mediaData.video ? CamOn : CamOff}
            onClick={() => changeMode("video")}
            title="video cam"
            alt="cam"
          />

          <img
            className="svg screen"
            src={ScreenShare}
            onClick={() => shareScreen(voiceRedux, dispatch)}
            title="share screen"
            alt="screen"
          />
        </div>
        <img
          className="egress"
          title="end call"
          onClick={() => {
            history.push(`/chat/61ed960432479c682956838e/${hashId}`);
            window.location.reload();
          }}
          src={EndCall} alt="egressIcons"
          />
        <h4 className="p2p">p2p connection</h4>
      </div>
    </div>
  );
};

export { VoiceFrame };
