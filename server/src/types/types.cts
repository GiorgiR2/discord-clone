import { ObjectId } from "mongodb";
import { Types } from "mongoose";

interface connectedUsersI {
  username: string;
  status: "online" | "offline";
  tabsOpen: number;
};

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

interface loadCatsI {
  _id: string;
  name?: string;
  position?: number;
  voice?: boolean;
}

interface checkIpI {
  status: "0" | "1";
  username?: string;
  categories?: loadCatsI[];
  authentication?: string;
}

interface checkDataI {
  status: "0" | "success";
  username?: string;
  categories?: any;
  authentication?: string;
}

interface checkLoginI {
  status: "done" | "try again";
  roomId?: string;
  hashId?: string | undefined;
}

interface SocketData {
  name: string;
  age: number;
}

export { connectedUsersI, voiceI, usersInVoiceI, addToMongooseDataI, roomI, messageI, loadCatsI, checkIpI, checkDataI, checkLoginI };