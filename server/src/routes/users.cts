import express, { Request, Response, Router } from "express";
import bp from "body-parser";

const multer = require("multer"); // for file uploading
const upload = multer({ dest: "profile_pictures" });

const router: Router = express.Router();

import { registerUser, checkLogin, checkData, addIp, removeIp } from "../ts/userOperations.cjs";

import usersModel from "../models/user.model.cjs";
import saveModel from "../ts/saveModel.cjs";

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

router.post("/api/users/changePassword", async (req: Request, res: Response) => {
  let username = req.body.username;
  let oldPassword = req.body.oldPassword;
  let newPassword = req.body.newPassword;

  const filter = { username: username };
  let user = await usersModel.findOne(filter);
  if (user?.password === oldPassword && user !== null) {
    user.password = newPassword;
    res.send({ status: "done" });
  }
  else {
    res.send({ status: "wrong password" });
  }
  await user!.save();
});

router.delete("/api/users/deleteAccount", async (req: Request, res: Response) => {
  console.log("deleting account:", req.headers.Authorization);
  console.log("username:", req.body.username);

  usersModel.findOneAndDelete({ username: req.body.username }).exec();

  res.send({ status: "done" });
});

router.post("/api/users/addProfilePicture", upload.single("image"), async (req: Request, res: Response) => {
  // @ts-ignore
  console.log("new profile image:", req.body.user, req.file.path);
  // @ts-ignore
  await usersModel.findOneAndUpdate({ username: req.body.user }, { imageDir: req.file.path });
  await res.send({ status: "done" });
});

router.get("/api/users/checkImageAvailability/:userName", (req: Request, res: Response) => {
  usersModel.findOne({ username: req.params.userName })
    .then(user => {
      if (user?.imageDir !== null) {
        console.log("exist", user?.imageDir);
        res.send({ status: "exists" });
      }
      else {
        console.log("exist", user.imageDir);
        res.send({ status: "do not exist" });
      }
    });
});

const handleDownload = async (req: Request, res: Response) => {
  const user: any = await usersModel.findOne({ username: req.params.userName });
  await res.download(user.imageDir, "profileImage.png");
};
router.route("/api/users/profilePicture/:userName").get(handleDownload).post(handleDownload);

module.exports = router;
// export default router;