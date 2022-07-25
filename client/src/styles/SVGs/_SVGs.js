import React from 'react';

import { editCat } from '../../components/Chat/_editCat';

// import CamOff from './videoOff.svg';
// import FullScreen0 from './fullScreen.svg';

const changeMode = (mediaData, setMediaData, button) => {
    // "data" should be immutable (send a new array each time)
    let data = { audio: mediaData.audio, video: mediaData.video };

    if (button === "video")
        data.video = !mediaData.video;
    else if (button === "audio")
        data.audio = !mediaData.audio;

    setMediaData(data);
}

const EditSVG = ({ id, display, setDisplay, setElementId}) => (
    <svg
    onClick={(e) => editCat(e, id, display, setDisplay, setElementId)}
    xmlns="http://www.w3.org/2000/svg"><path d="M18.303 4.742L16.849 3.287C16.678 3.116 16.374 3.116 16.203 3.287L13.142 6.351H2.01901C1.76801 6.351 1.56201 6.556 1.56201 6.807V16.385C1.56201 16.636 1.76801 16.841 2.01901 16.841H15.702C15.954 16.841 16.159 16.636 16.159 16.385V7.533L18.303 5.387C18.481 5.208 18.483 4.917 18.303 4.742ZM15.258 15.929H2.47601V7.263H12.23L9.69501 9.792C9.63801 9.849 9.59401 9.922 9.57601 10.004L9.18001 11.36H5.20001C4.94901 11.36 4.74301 11.565 4.74301 11.816C4.74301 12.069 4.94801 12.272 5.20001 12.272H9.53601C9.55901 12.272 10.435 12.292 11.034 12.145C11.346 12.068 11.584 12.008 11.584 12.008C11.664 11.99 11.739 11.949 11.796 11.89L15.259 8.447V15.929H15.258ZM11.241 11.156L10.163 11.423L10.43 10.347L16.527 4.256L17.335 5.064L11.241 11.156Z" fill="#fff"/></svg>
)

const MicSVGOff = ({ mediaData, setMediaData }) => <svg className="svg micoff" onClick={() => changeMode(mediaData, setMediaData, "audio")} aria-hidden="false" viewBox="0 0 24 24"><path d="M6.7 11H5C5 12.19 5.34 13.3 5.9 14.28L7.13 13.05C6.86 12.43 6.7 11.74 6.7 11Z" fill="currentColor"></path><path d="M9.01 11.085C9.015 11.1125 9.02 11.14 9.02 11.17L15 5.18V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 11.03 9.005 11.0575 9.01 11.085Z" fill="currentColor"></path><path d="M11.7237 16.0927L10.9632 16.8531L10.2533 17.5688C10.4978 17.633 10.747 17.6839 11 17.72V22H13V17.72C16.28 17.23 19 14.41 19 11H17.3C17.3 14 14.76 16.1 12 16.1C11.9076 16.1 11.8155 16.0975 11.7237 16.0927Z" fill="currentColor"></path><path d="M21 4.27L19.73 3L3 19.73L4.27 21L8.46 16.82L9.69 15.58L11.35 13.92L14.99 10.28L21 4.27Z" class="strikethrough-2Kl6HF" fill="currentColor"></path></svg>
const MicSVGOn = ({ mediaData, setMediaData }) => <svg className="svg micon" onClick={() => changeMode(mediaData, setMediaData, "audio")} aria-hidden="false" viewBox="0 0 24 24"><path d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V21H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1ZM12 4C11.2 4 11 4.66667 11 5V11C11 11.3333 11.2 12 12 12C12.8 12 13 11.3333 13 11V5C13 4.66667 12.8 4 12 4Z" fill="currentColor"></path><path d="M14.99 11C14.99 12.66 13.66 14 12 14C10.34 14 9 12.66 9 11V5C9 3.34 10.34 2 12 2C13.66 2 15 3.34 15 5L14.99 11ZM12 16.1C14.76 16.1 17.3 14 17.3 11H19C19 14.42 16.28 17.24 13 17.72V22H11V17.72C7.72 17.23 5 14.41 5 11H6.7C6.7 14 9.24 16.1 12 16.1Z" fill="currentColor"></path></svg>

const CamSVGOff = ({ mediaData, setMediaData }) => <img className="svg camoff" onClick={() => changeMode(mediaData, setMediaData, "video")} src={require("./camOff.svg")} />
const CamSVGOn = ({ mediaData, setMediaData }) => <svg className="svg camon" onClick={() => changeMode(mediaData, setMediaData, "video")} aria-hidden="false" viewBox="0 0 24 24"><path fill="currentColor" d="M21.526 8.149C21.231 7.966 20.862 7.951 20.553 8.105L18 9.382V7C18 5.897 17.103 5 16 5H4C2.897 5 2 5.897 2 7V17C2 18.104 2.897 19 4 19H16C17.103 19 18 18.104 18 17V14.618L20.553 15.894C20.694 15.965 20.847 16 21 16C21.183 16 21.365 15.949 21.526 15.851C21.82 15.668 22 15.347 22 15V9C22 8.653 21.82 8.332 21.526 8.149Z"></path></svg>

const ScreenShareOff = ({ mediaData, setMediaData }) => <></>
const ScreenShareOn = ({ mediaData, setMediaData }) => <svg className="svg screenon" onClick={() => changeMode(mediaData, setMediaData, "screen")} viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zM4 16V6h16v10.01L4 16zm9-6.87c-3.89.54-5.44 3.2-6 5.87 1.39-1.87 3.22-2.72 6-2.72v2.19l4-3.74L13 7v2.13z"/></svg>

// const FullScreen = () => <img className="svg fullscreen" onClick={() => changeMode()} src={require('./fullScreen.svg')} /> // <FullScreen0 />

export {
    EditSVG,

    MicSVGOff,
    MicSVGOn,

    CamSVGOff,
    CamSVGOn,

    ScreenShareOff,
    ScreenShareOn,

    // FullScreen
};