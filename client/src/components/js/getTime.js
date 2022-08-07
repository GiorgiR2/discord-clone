const getTime = () => {
  let currentdate = new Date();

  let datetime = `${
    currentdate.getMonth() + 1
  }/${currentdate.getDate()}/${currentdate.getFullYear()} ${currentdate.getHours()}:${currentdate.getMinutes()}`;

  return datetime;
};

export default getTime;
