import { useRef } from "react";
import { useParams } from "react-router";

import axios from "axios";
import FormData from "form-data";

import { emojiT, interfaceInitialStateValueI, messageI } from "../../../types/types";
import { RootState } from "../../..";

import { editMessage, enterFocusMode, exitEditMode, exitFocusMode } from "../../../features/interfaces";
import { setContextMenu } from "../../../features/toggle";

import { useDispatch, useSelector } from "react-redux";

import getTime from "../../../scripts/getTime";
import * as socks from "../../../scripts/_socketSide";

import packageJson from "../../../../package.json";

import "./_messages.sass";

const sendSVG: string = require("../../../assets/send-24px.svg").default;
const fileSVG: string = require("../../../assets/fileIcon.svg").default;
const userSVG: string = require("../../../assets/chat/user-flat.svg").default;
const plusSVG: string = require("../../../assets/chat/plus.svg").default;
const emojiSVG: string = require("../../../assets/chat/emoji.svg").default;

const apiLink = packageJson.proxy;

const MessagesDivs = (): JSX.Element => {
  const handleContextMenu = (e: any, id: string) => {
    e.preventDefault();

    const { pageX, pageY } = e;
    dispatch(enterFocusMode({_id: id}));
    dispatch(
      setContextMenu({
        contextMenu: { show: true, x: pageX, y: pageY, id: id },
      })
    );
  };
  const handleOnInput = (event: any, id: string) => {
    // console.log("OnInput:", event.target.innerHTML, id);
  };
  const handleOnBlur = (event: any, id: string) => {
    //Todo: get p content, update that specific line and then send post request
    // console.log("OnBlur");
    dispatch(editMessage({ messageHTML: event.target.innerHTML, _id: id }));
    dispatch(exitEditMode({ _id: id }));
    dispatch(exitFocusMode({ _id: id }));
    socks.editMessage(event.target.innerHTML, id);
  };
  const attachEmoji = (messageId: string, emoji: emojiT) => {
    // console.log(`Id: ${messageId}; emoji: ${emoji}`);
    socks.attackEmoji(messageId, emoji, reduxData.currentRoom);
  };

  const dispatch = useDispatch();
  const reduxData = useSelector((state: RootState) => state.interfaces.value);

  return (
    <div className="messageDivs">
      {reduxData.messages.map((el: messageI) => {
        // msg may be a text / a multiline text or a fileID
        let link = `${apiLink}/file/${el.message}`; // msg === Id

        return (
            <div className={`messageDiv ${(el.editMode || el.focusMode) ? "focus" : null}`}>
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
                            {/*<h4 className="encryption">No Encryption</h4>*/}
                        </div>
                        <div className="message">
                            {el.isFile ? (
                            <div className="fileDiv">
                                <img src={fileSVG} className="fileSVG" alt="file" />
                                <a
                                href={link}
                                rel="noreferrer"
                                target="_blank"
                                className="name"
                                >
                                {el.fileName}
                                </a>
                            </div>
                            ) : (
                            <p
                                onInput={(event) => handleOnInput(event, el._id)}
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
                            )}
                        </div>
                    </div>

                    <div className={`settings ${el.focusMode ? "visible" : null}`}>
                        <div className="emojiDiv">
                            <img src={emojiSVG} alt="emoji" id="emoji" />
                            <div className="emojiContent">
                                <div className="frequentlyUsed">
                                    <h5>Frequently Used</h5>
                                    {reduxData.frequentlyUsedEmojis.map(emoji => <span onClick={() => attachEmoji(el._id, emoji)}>{emoji}</span>)}
                                </div>
                                <div className="other">
                                    <h5>Smileys & People</h5>
                                    {reduxData.otherEmojis.map(emoji => <span onClick={() => attachEmoji(el._id, emoji)}>{emoji}</span>)}
                                </div>
                            </div>
                        </div>
                        <h5 onClick={(event) => handleContextMenu(event, el._id)} id="dots">···</h5>
                    </div>
                </div>

                <div className={`emojis ${el.emojis.length === 0 ? "hidden" : null}`}>
                    {el.emojis.map(emojiData => (
                        <div className="emoji">
                            <span className="smile">{emojiData.emoji}</span>
                            <span className="num">{emojiData.num}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
      })}
    </div>
  );
}

const Messages = () => {
    const handleSubmit = (file: any) => {
        const sendFileData = () => {
            socks.sendFileData({
                reduxData,
                roomId,
                datetime,
                size: file.size,
                filename: file.name,
            });
        };
        // if (window.innerWidth <= 800) {
        //   socks.sendMessage(e, reduxData, roomId, "mobile", inputRef);
        //   return;
        // }
        if (file === undefined) return;

        const url = `${apiLink}/upload`;
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
        .post(url, formData, config)
        .then((res) => {
            // console.log("send file; res:", res.data);
            if (res.data === "done") sendFileData();
        })
        .catch((err) => sendFileData());

        // console.log("!!!!!!!!!!", file.name, file.size, typeof file.size);
    };

    const reduxData = useSelector((state: RootState) => state.interfaces.value);

    let { roomId, hashId } = useParams<{ roomId: string; hashId: string }>();

    const inputRef = useRef<HTMLTextAreaElement>(null);

    return (
        <>
        <div id="chat-screen">
            <MessagesDivs />
            <div id="last-element"></div>
        </div>
        <div id="input">
            <div className="textInput">
            <div className="fileUpload">
                {/* @ts-ignore */}
                <label for="file">
                <img src={plusSVG} className="fileSVG" alt="fileSVG"/>
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
                onKeyPress={(event) =>
                socks.sendMessage({
                    event,
                    reduxData,
                    roomId,
                    device: "desktop",
                    inputRef,
                })
                }
                autoFocus={window.innerWidth <= 850 ? false : true}
            ></textarea>

            <img
                className="send"
                src={sendSVG}
                alt="send"
                onClick={(event) =>
                socks.sendMessage({
                    event,
                    reduxData,
                    roomId,
                    device: "mobile",
                    inputRef,
                })
                }
            />
            </div>
        </div>
        </>
    );
}

export default Messages;