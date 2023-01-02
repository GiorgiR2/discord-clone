import axios from "axios";
import packageJson from "../../package.json";

import { addUserName, setAuthentication, addRooms } from "../features/users";

const apiLink = packageJson.proxy;
const config = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};

const getBasicData = (history, roomId, hashId, dispatch, frame = "none") => {
  if (hashId === undefined && localStorage.getItem("hashId") !== null) {
    roomId = "61ed960432479c682956802b";
    hashId = localStorage.getItem("hashId");
    history.push(`/chat/${roomId}/${hashId}`);
  } else if (hashId !== undefined) {
    console.log("hashId:", hashId);
    axios
      .post(`${apiLink}/api/users/hashId`, { hashId: hashId })
      .then((res) => {
        if (res.data.status === "success") {
          // console.log("success");
          // if (frame !== "chat") history.push(`/chat/${roomId}/${hashId}`);
          // else {
          let username = res.data.username;
          dispatch(setAuthentication(res.data.authentication));
          dispatch(addUserName({ username: username }));
          dispatch(addRooms({ rooms: res.data.categories }));
          // }
        } else {
          // console.log("status:", res.data.status);
          history.push("/");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
  return;
};

export { getBasicData };
