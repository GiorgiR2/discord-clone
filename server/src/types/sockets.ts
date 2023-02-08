
interface joinI {
    username: string;
    room: string;
}

interface messageIS {
    authentication: string;
    _id: string;
    room: string;
    roomId: string;
    datetime: string;
    username: string;
    message: string;
    isFile: boolean;
    edited: boolean;
}

interface deleteMessageI {
    _id: string;
    room: string;
}

interface editMessageI {
    _id: string;
    messageHTML: string;
}

interface fileI {
    authentication: string;
    user: string;
    datetime: string;
    room: string;
    roomId: string;
    size: string;
    filename: string;
}

type emojiT = "👍" | "😀" | "😘" | "😍" | "😆" | "😜" | "😅" | "😂" | "😱" | "😁" | "🤣" | "🙂" |
             "🙃" | "😉" | "🥲" | "🤑" | "🥵" | "🥶" | "😎" | "🤓" | "😨" | "💩" | "👎" | "✊";

interface attachEmojiI {
    emoji: emojiT;
    _id: string; // messageId
    _user: string;
    room: string;
}

export { emojiT, attachEmojiI, fileI, editMessageI, deleteMessageI, messageIS, joinI };