interface roomI {
    _id: string;
    name: string;
    position: number;
    voice: boolean;
}

type emojiDataT = Omit<attachEmojiI, "room" | "_id">;
interface messageI {
    user: string;
    message: string;
    date: string;
    isFile: boolean;
    fileName: string;
    _id: string;
    editMode: boolean;
    focusMode: boolean;
    edited: boolean;
    emojis: emojiDataT[];
}

interface statusI {
    status: "online" | "offline";
    username: string;
}

interface optionsI {
    chat: boolean;
    voice: boolean;
}

interface voiceInitialStateValueI {
    currentStatus: string;
    localStream: any;
    mediaData: { audio: boolean; video: boolean; screen: boolean; };
    screenBeenShared: boolean;
    remoteUsers: {
      user: string;
      from: string; name: string; status: string; 
}[];
    remoteStreams: [string, any][];
}

interface toggleInitialStateValueI {
    toggleLeft: boolean;
    toggleRight: boolean;
    contextMenu: { show: boolean; x: number; y: number; id: string | null};
    displayEdit: boolean;
    displayAdd: boolean;
    displaySettings: boolean;
    editingCatId: string | null;
    toggleRooms: boolean;
}

interface interfaceInitialStateValueI {
    authentication: string;
    currentUser: string;
    currentRoom: string;
    currentRoomId: string;
    rooms: roomI[];
    draggingRoomId: string | null;
    draggingRoomIndex: number;
    online: string[];
    offline: string[];
    messages: messageI[];
    moreMessagesLoaded: number;
    voiceMode: boolean;
    frequentlyUsedEmojis: emojiT[];
    otherEmojis: emojiT[];
    focusMessageId: string | null;
    reactedBy: string[];
}

interface sendFileDataI {
    reduxData: interfaceInitialStateValueI;
    id: string,
    // roomId: string;
    // datetime: string;
    size: string;
    filename: string;
}

interface frameI {
    user: string;
    status: string;
    from: string;
}

interface userDataI {
    currentRoom: string;
    currentRoomId: string;
    currentUser: string;
}

interface modeI {
    payload: {
        _id: string;
    };
}

interface editMessageI {
    payload: {
        _id: string;
        messageHTML: string;
    };
}

interface attachEmojiI {
    _id: string;
    room: string;
    emoji: emojiT;
    num: number;
}

interface attachEmojiRX {
    payload: Omit<attachEmojiI, "room">;
}

interface emojiDivI {
    _id?: string;
    side: "top" | "bottom";
    input?: any;
}

type emojiT = "👍" | "😀" | "😘" | "😍" | "😆" | "😜" | "😅" | "😂" | "😱" | "😁" | "🤣" | "🙂" |
             "🙃" | "😉" | "🥲" | "🤑" | "🥵" | "🥶" | "😎" | "🤓" | "😨" | "💩" | "👎" | "✊";

type peerConnectionsT = [string, RTCPeerConnection];

export type { roomI, messageI, optionsI, statusI, voiceInitialStateValueI, toggleInitialStateValueI, interfaceInitialStateValueI,
              sendFileDataI, frameI, peerConnectionsT, userDataI, modeI, editMessageI, emojiT, attachEmojiI,
              attachEmojiRX, emojiDivI, emojiDataT };