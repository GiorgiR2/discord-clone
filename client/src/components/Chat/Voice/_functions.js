// import { socket } from "../../../scripts/_socketSide";
import io from "socket.io-client";
import packageJson from "../../../../package.json";

import voice, {
  addRemoteUser,
  addStream,
  addLocalStream,
} from "../../../features/voice";

const domain = packageJson.proxy;
var socket = io.connect(domain);

var localStream;
var peerConnections = [];

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

const init = async (voiceRedux, dispatch) => {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  dispatch(addLocalStream({ stream: localStream }));

  // document.getElementById("currentVideo").srcObject = localStream;
};

const toggleVideo = (bool) => {
  const videoTrack = localStream
    .getTracks()
    .find((track) => track.kind === "video");
  videoTrack.enabled = bool;
  // if (!bool) {
  //   localStream.getTracks().forEach((track) => track.stop());
  // } else {
  //   init(voiceRedux, dispatch);
  //   if (!localStream) {
  //     localStream = await navigator.mediaDevices.getUserMedia({
  //       audio: false,
  //       video: true,
  //     });
  //     // document.getElementById("currentVideo").srcObject = localStream;
  //   }
  //   localStream.getTracks().forEach((track) => {
  //     peerConnections.map((peer) => {
  //       peer[1].addTrack(track, localStream);
  //     });
  //   });
  // }
  // videoTrack.enabled = bool;
};

const toggleAudio = (bool) => {
  const audioTrack = localStream
    .getTracks()
    .find((track) => track.kind === "audio");
  audioTrack.enabled = bool;
};

const generateIceCandidates = async (id) => {
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

const createPeerConnection = async (voiceRedux, dispatch, id) => {
  // common part of createOffer and createAnswer functions
  let pc = new RTCPeerConnection(servers);
  peerConnections.push([id, pc]);
  let rs = new MediaStream(); // empty stream
  dispatch(addStream({ stream: [id, rs] }));

  // document.getElementById(id).srcObject = rs;

  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });
    // document.getElementById("currentVideo").srcObject = localStream;
  }

  await generateIceCandidates(id);

  // send local streams
  localStream.getTracks().forEach((track) => {
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

const createOffer = async (voiceRedux, dispatch, fromId) => {
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

const createAnswer = async (voiceRedux, dispatch, offer, fromId) => {
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

const addAnswer = async (answer, id) => {
  peerConnections.forEach((peerConnection) => {
    if (peerConnection[0] === id) {
      peerConnection[1].setRemoteDescription(answer);
    }
  });
};

const handleMessageFromPeer = async (voiceRedux, dispatch, text, fromId) => {
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

const handleUserJoined = (voiceRedux, dispatch, fromId) => {
  createOffer(voiceRedux, dispatch, fromId);
};

const voiceMain = (voiceRedux, userData, dispatch) => {
  console.log("voiceMain run");

  socket.emit("joinVoice", {
    room: userData.currentRoom,
    roomId: userData.currentRoomId,
    username: userData.currentUser,
  });

  socket.on("joined", (data) => {
    dispatch(
      addRemoteUser({
        from: data.from,
        username: data.username,
        status: "No Video",
      })
    );
    console.log("user joined", data.from);
    handleUserJoined(voiceRedux, dispatch, data.from);
  });
  socket.on("offer", (data) => {
    dispatch(
      addRemoteUser({
        from: data.from,
        username: userData.currentUser,
        status: "No Video",
      })
    );
    console.log("receive offer from:", data.from);
    handleMessageFromPeer(voiceRedux, dispatch, data.text, data.from);
  });
  socket.on("candidate", (data) => {
    console.log("receive ice candidate from:", data.from);
    handleMessageFromPeer(voiceRedux, dispatch, data.text, data.from);
  });
  socket.on("answer", (data) => {
    console.log("receive answer from:", data.from);
    handleMessageFromPeer(voiceRedux, dispatch, data.text, data.from);
  });
  socket.on("peerDisconnected", (data) => {
    //pass
  });

  init(voiceRedux, dispatch);
};

export { voiceMain, toggleVideo, toggleAudio };
