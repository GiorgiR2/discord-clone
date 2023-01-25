interface roomI {
    _id: string;
    name: string;
    position: number;
    voice: boolean;
}

interface messageI {
    user: string;
    message: string;
    date: string;
    isFile: boolean;
    fileName: string;
    _id: string;
    editMode: boolean;
    edited: boolean;
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
    mediaData: { audio: boolean; video: boolean; };
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
    editingCatId: string | null;
    displayAdd: boolean;
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
    voiceMode: boolean;
}

interface sendFileDataI {
    reduxData: interfaceInitialStateValueI;
    roomId: string;
    datetime: string;
    size: string;
    filename: string;
}

interface sendMessageI {
    event: any;//React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLImageElement, MouseEvent>;
    reduxData: interfaceInitialStateValueI;
    roomId: string;
    device: "mobile" | "desktop";
    inputRef: any;
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

type peerConnectionsT = [string, RTCPeerConnection];

export type { roomI, messageI, optionsI, statusI, voiceInitialStateValueI, toggleInitialStateValueI, interfaceInitialStateValueI,
    sendFileDataI, sendMessageI, frameI, peerConnectionsT, userDataI };