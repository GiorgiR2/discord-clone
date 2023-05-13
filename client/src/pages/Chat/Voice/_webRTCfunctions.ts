// import { socket } from "../../../scripts/_socketSide";
import io from "socket.io-client";
import { AppDispatch } from "../../..";
import packageJson from "../../../../package.json";

import {
  addRemoteUser,
  addStream,
  addLocalStream,
  disconnectRemoteUser,
  changeRemoteStatus,
  setScreenSharing,
  turnOffVideo,
  setScreenBeenShared,
  setCurrentStatus,
} from "../../../features/voice";
import { peerConnectionsT, userDataI, voiceInitialStateValueI } from "../../../types/types";

const domain = packageJson.proxy;
// @ts-expect-error
var socket = io.connect(domain);

var localStream: any;
var peerConnections: peerConnectionsT[] = [];

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const init = async (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch) => {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: voiceRedux.mediaData.audio,
    video: voiceRedux.mediaData.video
  });
  dispatch(addLocalStream({ stream: localStream }));

  // document.getElementById("currentVideo").srcObject = localStream;
};

const shareScreen = async (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch) => {
  // toggle
  if (voiceRedux.mediaData.screen) {
    var tracks = localStream.getTracks();
    for (var i = 0; i < tracks.length; i++) tracks[i].stop();
    toggleVideoScreen(false);
    dispatch(setCurrentStatus({ status: "No Video" }));
  }
  else {
    dispatch(setScreenBeenShared({ status: true }));
    dispatch(setCurrentStatus({ status: "" }));
    dispatch(turnOffVideo());
    // @ts-expect-error
    localStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
    dispatch(addLocalStream({ stream: localStream }));

    peerConnections.forEach(pr => {
      localStream.getTracks().forEach((track: any) => {
        // @ts-expect-error
        const sender = pr[1].getSenders().find(s => s.track.kind === "video");
        sender?.replaceTrack(track);
      });
    });
  }
  dispatch(setScreenSharing({ status: !voiceRedux.mediaData.screen }));
}

const toggleVideoScreen = (value: boolean) => {
    const videoTrack = localStream
      .getTracks()
      .find((track: any) => track.kind === "video");
    videoTrack.enabled = value;
}

const toggleVideo = async (voiceRedux: any, dispatch: any, bool: boolean) => {
  // this part of the code is quite confusing, so please do not touch it
  if (voiceRedux.screenBeenShared && voiceRedux.mediaData.video === false) {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: voiceRedux.mediaData.audio,
      video: !voiceRedux.mediaData.video
    });
    peerConnections.forEach(pr => {
      localStream.getTracks().forEach((track: any) => {
        // @ts-expect-error
        const sender = pr[1].getSenders().find(s => s.track.kind === "video");
        sender?.replaceTrack(track);
      });
    });
    dispatch(setScreenBeenShared({ status: false }));
    dispatch(addLocalStream({ stream: localStream }));
    bool = true;
  }
  toggleVideoScreen(bool);
};

const toggleAudio = (bool: boolean) => {
  const audioTrack = localStream
    .getTracks()
    .find((track: any) => track.kind === "audio");
  audioTrack.enabled = bool;
};

const generateIceCandidates = async (id: string) => {
  // this will be triggered after we create the offer and setLocalDescription(offer)
  // after this we are going to send the offer with all iceCandidates using sockets
  peerConnections.forEach((peerConnection) => {
    if (peerConnection[0] === id) {
      peerConnection[1].onicecandidate = async (event) => {
        socket.emit("candidate", {
          text: JSON.stringify({
            type: "candidate",
            candidate: event.candidate,
          }),
          id: id,
        });
      };
    }
  });
};

const createPeerConnection = async (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch, id: string) => {
  // common part of createOffer and createAnswer functions
  let pc = new RTCPeerConnection(servers);
  peerConnections.push([id, pc]);
  let rs = new MediaStream(); // empty stream
  dispatch(addStream({ stream: [id, rs] }));

  // document.getElementById(id).srcObject = rs;

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    // document.getElementById("currentVideo").srcObject = localStream;
  }

  await generateIceCandidates(id);

  // send local streams
  localStream.getTracks().forEach((track: any) => {
    pc.addTrack(track, localStream);
  });

  // receive remote streams
  peerConnections.forEach((peerConnection) => {
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        rs.addTrack(track);
      });
    };
  });
};

const createOffer = async (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch, fromId: string) => {
  await createPeerConnection(voiceRedux, dispatch, fromId);

  console.log("peerConnections:", peerConnections);
  // create offer
  peerConnections.forEach(async (peerConnection) => {
    if (peerConnection[0] === fromId) {
      let offer = await peerConnection[1].createOffer();
      await peerConnection[1].setLocalDescription(offer);
      socket.emit("offer", {
        text: JSON.stringify({ type: "offer", offer: offer }),
        id: fromId,
      });
    }
  });
};

const createAnswer = async (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch, offer: any, fromId: string) => {
  await createPeerConnection(voiceRedux, dispatch, fromId);

  peerConnections.forEach(async (peerConnection) => {
    if (peerConnection[0] === fromId) {
      await peerConnection[1].setRemoteDescription(offer);
      let answer = await peerConnection[1].createAnswer();
      await peerConnection[1].setLocalDescription(answer);
      socket.emit("answer", {
        text: JSON.stringify({ type: "answer", answer: answer }),
        to: fromId,
      });
    }
  });
};

const addAnswer = async (answer: any, id: string) => {
  peerConnections.forEach((peerConnection) => {
    if (peerConnection[0] === id) {
      peerConnection[1].setRemoteDescription(answer);
    }
  });
};

const handleMessageFromPeer = async (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch, text: any, fromId: string) => {
  let msg = JSON.parse(text);
  if (msg.type === "offer") {
    await createAnswer(voiceRedux, dispatch, msg.offer, fromId);
  } else if (msg.type === "candidate") {
    peerConnections.forEach(async (peerConnection) => {
      if (peerConnection[0] === fromId) {
        await peerConnection[1].addIceCandidate(msg.candidate);
      }
    });
  } else if (msg.type === "answer") {
    await addAnswer(msg.answer, fromId);
  }
};

const handleUserJoined = (voiceRedux: voiceInitialStateValueI, dispatch: AppDispatch, fromId: string) => {
  createOffer(voiceRedux, dispatch, fromId);
};

const voiceMain = (voiceRedux: voiceInitialStateValueI, userData: userDataI, dispatch: AppDispatch) => {
  console.log("voiceMain run");

  socket.emit("joinVoice", {
    room: userData.currentRoom,
    roomId: userData.currentRoomId,
    username: userData.currentUser,
  });

  socket.on("joined", (data: any) => {
    dispatch(
      addRemoteUser({
        from: data.from,
        user: data.username,
        status: "",
      })
    );
    console.log("user joined", data.from);
    handleUserJoined(voiceRedux, dispatch, data.from);
  });
  socket.on("offer", (data: any) => {
    dispatch(
      addRemoteUser({
        from: data.from,
        user: userData.currentUser,
        status: "",
      })
    );
    console.log("receive offer from:", data.from);
    handleMessageFromPeer(voiceRedux, dispatch, data.text, data.from);
  });
  socket.on("candidate", (data: any) => {
    console.log("receive ice candidate from:", data.from);
    handleMessageFromPeer(voiceRedux, dispatch, data.text, data.from);
  });
  socket.on("answer", (data: any) => {
    console.log("receive answer from:", data.from);
    handleMessageFromPeer(voiceRedux, dispatch, data.text, data.from);
  });
  socket.on("peerDisconnected", (data: any) => {
    console.log("received peerDisconnected...", data.id);
    dispatch(disconnectRemoteUser({ id: data.id }));
  });
  socket.on("changeStatus", (data: any) => {
    console.log("received changeStatus...", data.id, data.status);
    dispatch(changeRemoteStatus({ id: data.id, status: data.status }));
  });

  init(voiceRedux, dispatch);
};

export { socket, voiceMain, toggleVideo, toggleAudio, shareScreen };
