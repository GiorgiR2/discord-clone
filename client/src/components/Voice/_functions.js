const init = () => {
  //pass
};

const createOffer = () => {
  //pass
};

const changeMode = (mediaData, setMediaData, button) => {
  // "data" should be immutable (send a new array each time)
  let data = { audio: mediaData.audio, video: mediaData.video };

  if (button === "video") {
    data.video = !mediaData.video;
  } else if (button === "audio") {
    data.audio = !mediaData.audio;
  }

  setMediaData(data);
};

export { changeMode };
