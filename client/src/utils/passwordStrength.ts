const checkStatus = (password0: string, password1: string, setPasswordStatus: any, setMatch: any): void => {
  if (password0 === "") {
    setPasswordStatus("");
  } else if (password0.length < 5) {
    setPasswordStatus("weak");
  } else if (password0.length >= 5 && strength(password0) > 3) {
    setPasswordStatus("strong");
  } else {
    setPasswordStatus("normal");
  }

  if (password0 === password1 && password0 !== "") {
    setMatch("match");
  } else if (password1.length === 0) {
    setMatch("");
  } else {
    setMatch("passwords must match");
  }
};

const strength = (password: string) => {
  let answer = 0;
  let weirdSymbols = 0;
  let numbers = 0;

  ",.<>/?'][{]\\|()-_=+!@#$%^&*~`".split("").forEach((el) => {
    if (password.includes(el) && weirdSymbols < 3) {
      weirdSymbols++;
      answer++;
    }
  });

  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((el) => {
    if (password.includes(el.toString()) && numbers < 3) {
      numbers++;
      answer++;
    }
  });
  return answer;
};

export { checkStatus };

