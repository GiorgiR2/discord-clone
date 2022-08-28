import axios from "axios";
import packageJson from "../../../package.json";

const server = packageJson.proxy;
const config = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};

const getBasicData = (
  history,
  setUserName,
  setAuthentication,
  setCatJson,
  frame = "none"
) => {
  axios
    .post(`${server}/api/users/status`, { junk: "" }, config)
    .then((res) => {
      if (res.data.status === "1") {
        if (frame !== "chat") history.push("/chat/");
        else if (setAuthentication) {
          let username = res.data.username;
          setAuthentication(res.data.authentication);
          setUserName(username);
          setCatJson(res.data.categories);
        }
      } else if (history.location.pathname !== "/signup") {
        history.push("/");
      }
    })
    .catch((err) => {
      console.error("f error", err);
      // history.push('/');
    });
};

export { getBasicData };
