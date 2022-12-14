import axios from "axios";
import packageJson from "../../../package.json";

import { addUserName, setAuthentication, addRooms } from "../../features/users";

const apiLink = packageJson.proxy;
const config = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};

const getBasicData = (history, dispatch, frame = "none") => {
  axios
    .post(`${apiLink}/api/users/status`, { junk: "" }, config)
    .then((res) => {
      // console.log(`pathname: '${history.location.pathname}'`);
      if (res.data.status === "1") {
        if (frame !== "chat") history.push("/chat");
        else {
          // else if (setAuthentication) // no idea why I had this
          let username = res.data.username;
          dispatch(setAuthentication(res.data.authentication));
          dispatch(addUserName({ username: username }));
          //setUserName(username);

          console.log(res.data.categories);
          dispatch(addRooms({ rooms: res.data.categories }));
        }
      } else if (history.location.pathname !== "/signup") {
        history.push("/");
      } else {
        // history.push("/");
      }
      // console.log(`path: "${history.location.pathname}"`);
    })
    .catch((err) => {
      console.error("error", err);
      // history.push('/');
    });
};

export { getBasicData };
