import { emojiT, frequentlyUsedEmojisT, otherEmojisT } from "../../../types/types";
import { RootState } from "../../..";

import { useSelector } from "react-redux";

import * as socks from "../../../scripts/_socketSide";

import "./_emojiDiv.sass";

const emojiSVG: string = require("../../../assets/chat/emoji.svg").default;

const frequentlyUsedEmojis: frequentlyUsedEmojisT[] = ["👍", "😀", "😘", "😍", "😆", "😜", "😅", "😂", "😱"];
const otherEmojis: otherEmojisT[] = ["😁", "🤣", "🙂", "🙃", "😉", "🥲", "🤑", "🥵", "🥶", "😎", "🤓", "😨", "💩", "👎", "✊"];

interface emojiDivI {
    id?: string;
    side: "top" | "bottom";
    input?: any;
    divFullOfMessages?: boolean;
    messageN?: number;
}

const attachEmoji = (currentRoom: string, currentUser: string, emoji: emojiT, id?: string, input?: any) => {
    if (id) {
        socks.attackEmoji(id, emoji, currentRoom, currentUser);
    }
    else {
        input.current.value += emoji;
    }
};

const EmojiDiv = ({ id, divFullOfMessages, side, input, messageN }: emojiDivI) => {
    const reduxData = useSelector((state: RootState) => state.interfaces.value);
    const { currentRoom, currentUser } = reduxData;
    const show = divFullOfMessages && messageN;

    return (
        <div key={id} className={`emojiDiv emojiDiv-${side}`}>
            <img src={emojiSVG} alt="emoji" className={`emoji`} />
            <div className={`emojiContent ${show && messageN >= reduxData.messages.length-2 ? "last-two" : null}`}>
                <div className="frequentlyUsed">
                    <h5>Frequently Used</h5>
                    {frequentlyUsedEmojis.map(emoji => <span onClick={() => attachEmoji(currentRoom, currentUser, emoji, id, input)}>{emoji}</span>)}
                </div>
                <div className="other">
                    <h5>Smileys & People</h5>
                    {otherEmojis.map(emoji => <span onClick={() => attachEmoji(currentRoom, currentUser, emoji, id, input)}>{emoji}</span>)}
                </div>
            </div>
        </div>
    );
}

export default EmojiDiv;