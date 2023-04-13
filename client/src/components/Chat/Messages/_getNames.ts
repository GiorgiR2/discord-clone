import axios from "axios";
import { setReactedBy } from "../../../features/interfaces";
import { emojiT } from "../../../types/types";

import packageJson from "../../../../package.json";

const apiLink = packageJson.proxy;

const getNames = (dispatch: any, emoji: emojiT, _messageId: string): void => {
    dispatch(setReactedBy({ messageId: _messageId, users: [] }));
    axios.get(`${apiLink}/emojis/${_messageId}/${emoji}`)
        .then(res => {
            // console.log("users:", res.data.users);
            dispatch(setReactedBy({ messageId: _messageId, users: res.data.users }));
        })
        .catch(err => console.error(err));
    
    setTimeout(() => {
        dispatch(setReactedBy({ messageId: null, users: [] }));
    }, 2000);
}

export default getNames;