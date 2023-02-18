import express, { Request, Response, Router } from "express";
import bp from "body-parser";

const router: Router = express.Router();

import { registerUser, checkLogin, checkData, addIp, removeIp } from "../ts/userOperations.cjs";

import usersModel from "../models/user.model.cjs";
import { checkLoginI } from "../types/types.cjs";

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET requests to /users...",
  });
});

router.post("/api/users/register", async (req: Request, res: Response) => {
  let username: string = req.body.username;
  let hashedPassword: string = req.body.hashedPassword;
  let ip = (req.headers["x-forwarded-for"] || req.connection.remoteAddress)?.toString();
  // let password0: string = req.body.password0;
  // let password1: string = req.body.password1;

  let response = await registerUser(username, hashedPassword, ip) //, password0, password1);
  res.send({ data: response });
});

router.post("/api/users/login", async (req: Request, res: Response) => {
  let ip = (req.headers["x-forwarded-for"] || req.connection.remoteAddress)?.toString();

  let username: string = await req.body.username;
  let password: string = await req.body.password;

  let data = await checkLogin(username, password);

  if (data.status === "done") {
    await addIp(username, ip);
    await res.send(data);
  } else {
    res.send({ status: "try again, wrong username and/or password" });
  }
});

router.post("/api/users/status", async (req: Request, res: Response) => {
  return;
  // const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  // const data = await checkIp(ip); //  { status: "0" } or "1"(with other params)
  // res.send(data);
});

router.post("/api/users/hashId", async (req: Request, res: Response) => {
  try {
    let name = await usersModel
      .find({
        hashId: req.body.hashId,
      })
      .exec();

    const data = await checkData(req.body.hashId);
    await res.send(data);
    // console.log("user hash successfully authenticated:", data, req.body.hash);
  } catch {
    await res.send({ roomName: "IncorrectHash" });
  }
});

router.post("/api/users/usernameByHashId", async (req: Request, res: Response) => {
  // console.log("/api/users/usernameByHashId:", req.body.hashId);
  let user = await usersModel.find({ hashId: req.body.hashId }).exec();
  console.log("sent!!!!!!!!", user[0].username);
  await res.send({ username: user[0].username });
});

module.exports = router;
// export default router;