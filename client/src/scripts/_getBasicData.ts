import axios from "axios";
import { History } from "history";

import { addUserName, setAuthentication, addRooms } from "../features/interfaces";

import packageJson from "../../package.json";

const apiLink = packageJson.proxy;

interface getBasicDataI {
  history: History;
  roomId?: string;
  hashId?: string | null | undefined;
  dispatch?: any;
  frame?: "none" | "chat";
}

const getBasicData = ({ history, roomId, hashId, dispatch }: getBasicDataI): void => {
  if (hashId === undefined && localStorage.getItem("hashId") !== null) {
    roomId = "61ed960432479c682956802b";
    hashId = localStorage.getItem("hashId");
    history.push(`/chat/${roomId}/${hashId}`);
  } else if (hashId !== undefined) {
    console.log("hashId:", hashId);
    axios
      .get(`${apiLink}/api/users/${hashId}`)
      .then((res) => {
        if (res.data.success) {
          // if (frame !== "chat") history.push(`/chat/${roomId}/${hashId}`);
          const { username, authentication, rooms } = res.data;
          dispatch(setAuthentication(authentication));
          dispatch(addUserName({ username }));
          dispatch(addRooms({ rooms }));
        } else {
          // console.log("status:", res.data.status);
          localStorage.removeItem("hashId");
          history.push("");
        }
      })
      .catch((error) => console.error(error));
  }
};

export { getBasicData };