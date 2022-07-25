import React, { useState, useEffect, useRef } from 'react';

import { socket } from '../js/_socketSide';

import Peer from 'simple-peer';

import { MicSVGOff, MicSVGOn, CamSVGOff, CamSVGOn, ScreenShareOff, ScreenShareOn, FullScreen } from '../../styles/SVGs/_SVGs';

import "./_voice.sass";

const egress = (history) => {
    history.push("/chat/61ed960432479c682956802b");
}

const Frame = ({ name, status, videoStream }) => (
    <div className="frame">
        <h4 className="name">{name}:</h4>
        {/* style={{height: 150, width: 100}} */}
        <video className="video" autoPlay controls ref={videoStream} />
        <h4 className="statusLabel">{status}</h4>
    </div>
)

const VoiceFrame = ({ history, roomId, userName }) => {
    const setLabel = (user, text) => {
        if (user === "current"){
            let newUsers = users;
            newUsers[0][1] = text;
            setUsers([...newUsers]);
        }
        else {
            //pass
        }
    }

    const [mediaStream, setMediaStream] = useState();

    const [users, setUsers] = useState([]);

    const videoStreams = [useRef(), useRef()]; // [0] is of current device

    const [mediaData, setMediaData] = useState({ audio: false, video: true });

    useEffect(() => {
        setUsers([[userName, ""]]);
        // socket.emit("join voice", {
        //     roomId: roomId,
        //     username: username,
        // });
        
        socket.on("all users", data => {
            // pass
        });

        socket.on("user joined", data => {
            // pass
        });

        socket.on("new stream", data => {
            // pass
        });
    }, []);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia(mediaData)
        .then(stream => {
            // console.log(stream);
            setMediaStream(stream);
            videoStreams[0].current.srcObject = stream;

            // Todo: set media label to "No Video"
            if (!mediaData.video)
                setLabel("current", "No Video");
            else
                setLabel("current", "");
        })
        .catch(err => {
            try {
                mediaStream.getTracks().forEach(track => track.stop());
                // Todo: set media label to "No Signal"
                setLabel("current", "No Signal");
            }
            catch (TypeError){
                // setLabel("current", "no video");
                // console.log("no shit...");
            }
        });
    }, [mediaData]);

    useEffect(() => {
        console.log(".......")
    }, [users]);

    return(
        <div className="webrtc">
            <div className="windows">
                {users.map((user, n) => <Frame name={user[0]} status={user[1]} videoStream={videoStreams[n]} />)}
            </div>

            <div className="bottom">
                <div className="icons">
                    {mediaData.audio ?
                    <MicSVGOn mediaData={mediaData} setMediaData={setMediaData} />
                    :
                    <MicSVGOff mediaData={mediaData} setMediaData={setMediaData} />
                    }
                    {mediaData.video ?
                    <CamSVGOn mediaData={mediaData} setMediaData={setMediaData} />
                    :
                    <CamSVGOff mediaData={mediaData} setMediaData={setMediaData} />
                    }
                    
                    <ScreenShareOn mediaData={mediaData} setMediaData={setMediaData} />
                </div>
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
    VoiceFrame,
}