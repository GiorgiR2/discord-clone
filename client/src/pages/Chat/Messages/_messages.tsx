import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import axios from "axios";
import FormData from "form-data";

import { messageI, emojiDataT } from "../../../types/types";
import { RootState } from "../../..";

import { addMessagesToTop, cleanReactedBy, editMessage, enterFocusMode, exitEditMode, exitFocusMode, incrementOldMessagesLoaded } from "../../../features/interfaces";
import { setContextMenu } from "../../../features/toggle";

import EmojiDiv from "./_emojiDiv";

import { useDispatch, useSelector } from "react-redux";

import getTime from "../../../utils/getTime";
import * as socks from "../../../scripts/_socketSide";

import packageJson from "../../../../package.json";

import "./_messages.sass";
import scrollToBottom from "../../../utils/scrollToBottom";
import getNames from "./_getNames";

import loadingGIF from "../../../assets/chat/loading.gif";

const sendSVG: string = require("../../../assets/send-24px.svg").default;
const fileSVG: string = require("../../../assets/fileIcon.svg").default;
const userSVG: string = require("../../../assets/chat/user-flat.svg").default;
const plusSVG: string = require("../../../assets/chat/plus.svg").default;

const apiLink = packageJson.proxy;

type formatT = "mp4" | "mpv" | "mkv";
interface videoBoolI {
    isVideo: boolean;
    format?: formatT;
}

const imageBool = (fileName: string): boolean => {
    const format: string = fileName.substr(-4);
    return format === ".png" || format === ".jpg" || format === "jpeg";
}
const videoBool = (fileName: string): videoBoolI => {
    const format: string = fileName.substr(-3);
    const isVideo = (format === "mp4" || format === "mpv" || format === "mkv");

    if (isVideo)
        return { isVideo, format };
    else
        return { isVideo };
}
const DisplayFile = ({ fileName, message }: { fileName: string, message: string }) => {
    const isImage = imageBool(fileName);
    const { isVideo, format } = videoBool(fileName);

    return (
        <div className="fileDiv">
            {isImage &&
                <img
                    src={`${apiLink}/file/${message}`}
                    className="imagePreview"
                    alt="image"
                    onLoad={() => scrollToBottom()}
                />
            }
            {isVideo &&
                <video
                    className="videoPreview"
                    onLoad={() => scrollToBottom()}
                    controls
                >
                    {/* <source src={`${apiLink}/file/${message}`} type={`video/${format}`} /> */}
                    <source src={`${apiLink}/file/${message}`} type={`video/mp4`} />
                </video>
            }
            {(isImage || isVideo) &&
                <a
                    href={`${apiLink}/file/${message}`}
                    rel="noreferrer"
                    target="_blank"
                    className="name"
                > save as </a>
            }

            {(!isImage && !isVideo) &&
                <>
                    <img src={fileSVG} className="fileSVG" alt="file" />
                    <a
                        href={`${apiLink}/file/${message}`}
                        rel="noreferrer"
                        target="_blank"
                        className="name"
                    >
                        {fileName}
                    </a>
                </>
            }
        </div>
    );
}

const Messages = () => {
    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, id: string) => {
        e.preventDefault();

        const { pageX, pageY } = e;
        dispatch(enterFocusMode({ id }));
        dispatch(
            setContextMenu({
                contextMenu: { show: true, x: pageX, y: pageY, id: id },
            })
        );
    };
    const handleOnBlur = (event: any, id: string) => {
        //Todo: get p content, update that specific line and then send post request
        // console.log("OnBlur");
        dispatch(editMessage({ messageHTML: event.target.innerHTML, id }));
        dispatch(exitEditMode({ id }));
        dispatch(exitFocusMode({ id }));
        socks.editMessage(event.target.innerHTML, id);
    };
    const handleSubmit = (file: any) => {
        const sendFileData = (_id: string) => {
            socks.sendFileData({
                reduxData,
                _id,
                size: file.size,
                filename: file.name,
            });
        };
        if (file === undefined) return;

        const formData = new FormData();
        const datetime = getTime();

        formData.append("file", file);
        formData.append("fileName", file.name);
        formData.append("room", reduxData.currentRoom);
        formData.append("user", reduxData.currentUser);
        formData.append("roomId", roomId);
        formData.append("datetime", datetime);
        formData.append("size", file.size);

        const config = {
            headers: {
                "content-type": "multipart/form-data",
            },
        };

        axios
            .post(`${apiLink}/upload`, formData, config)
            .then((res) => {
                // console.log("send file; res:", res.data);
                if (res.data.status === "done") {
                    sendFileData(res.data._id);
                }
            })
            .catch((err) => console.error(err));//sendFileData());
        // console.log("!!!!!!!!!!", file.name, file.size, typeof file.size);
    };
    const send = (mobile: boolean, event?: React.KeyboardEvent<HTMLTextAreaElement>) => {
        let message = inputRef.current.value;
        if ((event && (event.key === "Enter" && event.shiftKey !== true && message.length > 0)) || (mobile === true && message.length > 0)) {
            socks.sendMessage(reduxData, roomId, message);
            setTimeout(() => {
                inputRef.current.value = "";
            }, 10);
        }
    }
    const checkPosition = (event: any): void => {
        const chatDivPosition = document.querySelectorAll("#chat-screen")[0].scrollTop;
        // console.log("scroll position:", chatDivPosition);
        // if scrolled to top load more messages
        if (chatDivPosition === 0 && !loading) {
            setLoading(true);

            axios.get(`${apiLink}/moreMessages/${reduxData.currentRoom}/${reduxData.oldMessagesLoaded}/${reduxData.newMessagesLoaded}`)
                .then(res => {
                    setTimeout(() => {
                        if (res.data.messages.length > 0) {
                            dispatch(incrementOldMessagesLoaded());
                            dispatch(addMessagesToTop({ messages: res.data.messages }));
                        }
                        setLoading(false);
                    }, 700);
                })
                .catch(err => console.error(err));
        }
    }
    const scrollbarVisible = (): boolean => {
        const chatDivPosition = document.querySelectorAll("#chat-screen")[0];

        if (chatDivPosition?.scrollHeight) {
            return chatDivPosition.scrollHeight > chatDivPosition.clientHeight;
        }
        return false;
    }

    const dispatch = useDispatch();
    const reduxData = useSelector((state: RootState) => state.interfaces.value);

    const [loading, setLoading] = useState<boolean>(false);
    const [divFullOfMessages, setDivFullOfMessages] = useState<boolean>(false);

    const { roomId, } = useParams<{ roomId: string; hashId: string }>();

    const inputRef = useRef<any>("");

    useEffect(() => {
        setDivFullOfMessages(scrollbarVisible());
    }, [reduxData.messages]);

    return (
        <>
            <div id="chat-screen" onScroll={(event) => checkPosition(event)}>
                {loading && <img src={loadingGIF} id="loadingGif" />}
                {reduxData.messages.map((el: messageI, messageN: number) => (
                    <div className={`messageDiv ${(el.editMode || el.focusMode) ? "focus" : null}`} key={el._id}>
                        <div
                            className={`message element`}
                            onContextMenu={(event) => handleContextMenu(event, el._id)}
                        >
                            <img src={userSVG} alt="user" />
                            <div className="main">
                                <div className="top">
                                    <div className="author">
                                        {el.user} <span>{el.date}</span>
                                        {el.edited ? <span>(edited)</span> : null}
                                    </div>
                                </div>
                                <div className="message">
                                    {el.isFile ? <DisplayFile fileName={el.fileName} message={el.message} /> :
                                        <p
                                            onBlur={(event) => handleOnBlur(event, el._id)}
                                            contentEditable={el.editMode}
                                        >
                                            {el.message.split("\n").map((line: string) => (
                                                <>
                                                    {line}
                                                    <br />
                                                </>
                                            ))}
                                        </p>
                                    }
                                </div>
                            </div>

                            <div className={`settings ${el.focusMode ? "visible" : null}`}>
                                <EmojiDiv id={el._id} side="bottom" divFullOfMessages={divFullOfMessages} messageN={messageN} />
                                <h5 onClick={(event) => handleContextMenu(event, el._id)} className="dots">···</h5>
                            </div>
                        </div>

                        <div className={`emojisDiv ${el.emojis.length === 0 ? "hidden" : null}`}>
                            <div className="emojis">
                                {el.emojis.map((emojiData: emojiDataT, num: number) => (
                                    <div
                                        key={num}
                                        className="emoji"
                                        onMouseOver={() => getNames(dispatch, emojiData.emoji, el._id)}
                                        onMouseLeave={() => dispatch(cleanReactedBy())}>
                                        <span className="smile">{emojiData.emoji}</span>
                                        <span className="num">{emojiData.num}</span>
                                    </div>
                                ))}
                            </div>
                            <div className={`reactedBy ${reduxData.focusMessageId === el._id ? "" : "hidden"} ${divFullOfMessages && messageN >= reduxData.messages.length-2 ? "last-one" : null}`}>
                                {reduxData.reactedBy.map((user, userN: number) => (
                                    <div key={userN}>
                                        <span>{user}</span>
                                        <br />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <div id="last-element"></div>
            </div>
            <div id="input">
                <div className="textInput">
                    <div className="fileUpload">
                        {/* @ts-ignore */}
                        <label for="file">
                            <img src={plusSVG} className="fileSVG" alt="fileSVG" />
                        </label>
                        <input
                            type="file"
                            id="file"
                            onChange={(e) => {
                                // @ts-ignore
                                handleSubmit(e.target.files[0]);
                            }}
                        />
                    </div>

                    <textarea
                        id="text-area"
                        placeholder={`Message #${reduxData.currentRoom}`}
                        ref={inputRef}
                        onKeyPress={(event) => send(false, event)}
                        autoFocus={window.innerWidth <= 850 ? false : true}
                    ></textarea>

                    <EmojiDiv side="top" input={inputRef} />
                </div>
                <img
                    className="send"
                    src={sendSVG}
                    alt="send"
                    onClick={() => send(true)}
                />
            </div>
        </>
    );
}

export default Messages;