import { ObjectId } from "mongodb";
import { Types } from "mongoose";

interface connectedUsersI {
  // username: string;
  status: "online" | "offline";
  tabsOpen: number;
};

type connectedUsersT = Record<string, connectedUsersI>;

interface voiceII {
  [key: string]: {
    socketId: string;
    roomId: string;
  };
} 

interface voiceI {
  [key: string]: [] | [string, string];
}

interface usersInVoiceI {
  [key: string]: {
    id: string;
    username: string;
  }[];
}

interface addToMongooseDataI {
  username: string;
  isFile: boolean;
  originalName?: string;
  path?: string;
  datetime: string;
  room: string;
  roomId: string;
  size?: string;
  message?: string;
}

interface roomI {
  _id: string;
  room: string;
  position: number;
  voice: boolean;
}

interface messageI {
  _id: Types.ObjectId;
  room: string;
  roomId: string;
  date: string;
  user: string;
  message: string;
  isFile: boolean;
  edited: boolean;
}

interface loadRoomsI {
  _id: string;
  name?: string;
  position?: number;
  voice?: boolean;
}

interface checkDataI {
  success: boolean;
  username?: string;
  rooms?: loadRoomsI[];
  authentication?: string;
}

interface checkLoginI {
  success: boolean;
  roomId?: string;
  hashId?: string | undefined;
}

interface SocketData {
  name: string;
  age: number;
}

interface popOutI {
  authentication: string;
  username: string
};

export { connectedUsersT, voiceI, usersInVoiceI, addToMongooseDataI, roomI, messageI, loadRoomsI, checkDataI, checkLoginI, popOutI };