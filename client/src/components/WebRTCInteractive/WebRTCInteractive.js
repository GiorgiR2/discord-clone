import React, { useState, useRef } from 'react';

import io from 'socket.io-client';
import { connectTo, setUpFirstUser } from './_handleRTC';

import { MicSVGOff, MicSVGOn, CamSVGOff, CamSVGOn, ScreenShareOff, ScreenShareOn, FullScreen } from '../../styles/SVGs/_SVGs';

import "./_WebRTCInteractive.sass";

const egress = (history) => {
    history.push("/chat/61ed960432479c682956802b");
}

const Frame = ({ name, videoStream }) => (
    <div className="frame">
        <h4 className="name">{name}:</h4>
        <div>
            {/* <div className="SVGs">
                <MicSVGOff />
                <CamSVGOff />
                <FullScreen />
            </div> */}

            <video className="video" autoplay ref={videoStream} />
        </div>
    </div>
)

const WebRTCFrame = ({ history, roomId }) => {
    const domain = `http://${window.location.hostname}:6000`;

    // { name, id, properties: { audio: false, video: false } }
    const [peers, setPeers] = useState([]);

    const videoStreams = useRef([]);
    const videoStreamsTransfer = [];

    const socketRef = useRef();

    useEffect(() => {
        // navigator asks for audio and video access and then includes in "stream"
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
            videoStreams[0].current.srcObject = stream; // display for ourselves
            videoStreamsTransfer[0].current = stream; // store stream data for later

            socketRef.current = io.connect(domain);

            socketRef.current.emit("join voice", roomId);

            // get all users' data on startup
            socketRef.current.on("users online", users => {
                let peers0 = [];
                userData.forEach(user => {
                    peers0.push({
                        name: user,
                        id: user,
                        properties: { audio: false, video: false },
                    });
                });
                setPeers(peers0);
                // setUpFirstUser();
            });

            // get single user's data
            socketRef.current.on("user joined", user => {
                connectTo();
            });

            socketRef.current.on("offer", handleRecieveCall); //
            socketRef.current.on("answer", handleAnswer); //
            socketRef.current.on("ice-candidate", handleICECandidateMsg); //
        });

    }, []);

    return(
        <div className="webrtc">
            <div className="windows">
                {name.map((name, n) => <Frame name={name} videoStream={videoStreams[n]} />)}
            </div>

            <div className="bottom">
                <h4 className="controls">◄ controls</h4>
                <button className="egress" onClick={() => egress(history)}>egress</button>
            </div>
        </div>
    );
}

const screenShareOn = () => {
    // pass
}

const screenShareOff = () => {
    // pass
}

const webCamOn = () => {
    // pass
}

const webCamOff = () => {
    // pass
}

const micOn = () => {
    // pass
}

const micOff = () => {
    // pass
}

const checkMode = (voiceMode, setStatusLabel) => {
    if (!voiceMode)
        setStatusLabel("invalid");
}

export {
    WebRTC,
    WebRTCFrame
}