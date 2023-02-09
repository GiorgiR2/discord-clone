
import { emojiDivI, emojiT } from "../../../types/types";
import { RootState } from "../../..";

import { useSelector } from "react-redux";

import * as socks from "../../../scripts/_socketSide";

import "./_emojiDiv.sass";

const emojiSVG: string = require("../../../assets/chat/emoji.svg").default;

const EmojiDiv: React.FC<emojiDivI> = ({ _id, side, input }) => {
    const attachEmoji = (emoji: emojiT, messageId?: string) => {
        // console.log(`Id: ${messageId}; emoji: ${emoji}`);
        if(messageId){
            socks.attackEmoji(messageId, emoji, reduxData.currentRoom, reduxData.currentUser);
        }
        else{
            input.current.value += emoji;
        }
    };
    const reduxData = useSelector((state: RootState) => state.interfaces.value);
    
    return(
        <div className="emojiDiv">
            <img src={emojiSVG} alt="emoji" className="emoji" id={side} />
            <div className={`emojiContent ${side}`}>
                <div className="frequentlyUsed">
                    <h5>Frequently Used</h5>
                    {reduxData.frequentlyUsedEmojis.map(emoji => <span onClick={() => attachEmoji(emoji, _id)}>{emoji}</span>)}
                </div>
                <div className="other">
                    <h5>Smileys & People</h5>
                    {reduxData.otherEmojis.map(emoji => <span onClick={() => attachEmoji(emoji, _id)}>{emoji}</span>)}
                </div>
            </div>
        </div>
    );
}

export default EmojiDiv;