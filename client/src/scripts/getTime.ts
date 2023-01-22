const getTime = (): string => {
  let currentdate = new Date();

  let datetime: string = `${
    currentdate.getMonth() + 1
  }/${currentdate.getDate()}/${currentdate.getFullYear()} ${currentdate.getHours()}:${currentdate.getMinutes()}`;

  return datetime;
};

export default getTime;
