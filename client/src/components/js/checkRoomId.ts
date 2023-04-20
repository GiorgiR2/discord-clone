import { setVoiceMode, setRoomName, setRoomId } from "../../features/interfaces";
import axios from "axios";

const checkRoomId = (dispatch: any, apiLink: string, roomId: string, hashId: string, history: any) => {
  if (roomId === undefined || hashId === undefined) {
    history.push(`/chat/61ed960432479c682956802b/${hashId}`);
  }
  axios
    .post(`${apiLink}/api/roomId`, { id: roomId })
    .then((res) => {
      if (res.data.roomName !== "try_again") {
        dispatch(setRoomName({ name: res.data.roomName }));
        dispatch(setRoomId({ roomId: roomId }));
        if (res.data.voiceMode) {
          dispatch(setVoiceMode({ bool: true }));
        }
      } else {
        history.push(`/chat/61ed960432479c682956802b/${hashId}`); // roomId = "61ed960432479c682956802b";
        dispatch(setRoomName({ name: "room 1" }));
        dispatch(setRoomId({ roomId: "61ed960432479c682956802b" }));
        dispatch(setVoiceMode({ bool: false }));
      }
    })
    .catch((err) => console.error(err));
};

export { checkRoomId };
