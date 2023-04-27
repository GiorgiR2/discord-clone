import express, { Request, Response, Router } from "express";
import bp from "body-parser";
import sharp from "sharp";

const multer = require("multer"); // for file uploading
const upload = multer({ dest: "profile_pictures" });

const router: Router = express.Router();

import { registerUser, checkLogin, checkData, addIp } from "../ts/userOperations.cjs";

import usersModel from "../models/user.model.cjs";
import deletedUserModel from "../models/deletedUser.model.cjs";
import getIp from "../scripts/getIp.cjs";
import saveModel from "../ts/saveModel.cjs";

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET requests to /users...",
  });
});

router.post("/api/users/register", async (req: Request, res: Response) => {
  const { username, hashedPassword } = req.body;
  const ip = getIp(req);

  let response = await registerUser(username, hashedPassword, ip) //, password0, password1);
  res.send({ data: response });
});

router.post("/api/users/login", async (req: Request, res: Response) => {
  const ip = getIp(req);

  const { username, password } = await req.body;

  let data = await checkLogin(username, password);

  if (data.success) {
    await addIp(username, ip);
    await res.send(data);
  } else {
    res.send({ status: "try again, wrong username and/or password" });
  }
});

router.get("/api/users/:hashId", async (req: Request, res: Response) => {
  try {
    const { hashId } = req.params;

    const data = await checkData(hashId);
    await res.send(data);
    // console.log("user hash successfully authenticated:", data, req.body.hash);
  } catch {
    await res.send({ roomName: "IncorrectHash" });
  }
});

router.get("/api/users/usernameByHashId/:hashId", async (req: Request, res: Response) => {
  // console.log("/api/users/usernameByHashId:", req.body.hashId);
  const { hashId } = req.params;
  let user = await usersModel.find({ hashId }).exec();
  console.log("sent!!!!!!!!", user[0].username);
  await res.send({ username: user[0].username });
});

router.post("/api/users/changePassword", async (req: Request, res: Response) => {
  const { username, oldPassword, newPassword } = req.body;

  const filter = { username: username };
  const user = await usersModel.findOne(filter);
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
  const Authorization = req.headers.Authorization;
  const { username } = req.body;
  console.log("deleting account:", Authorization);
  console.log("username:", username);

  usersModel.findOneAndDelete({ username }).exec();

  let newDeletedUserModel = new deletedUserModel({
    username,
    ip: getIp(req),
  });
  saveModel(newDeletedUserModel);

  res.send({ status: "done" });
});

router.post("/api/users/addProfilePicture", upload.single("image"), async (req: Request, res: Response) => {
  // @ts-ignore
  const _imageDir = req.file.path;
  const newImageDir = _imageDir+0;

  sharp(_imageDir)
  .resize(82, 82)
  .toFile(newImageDir, (err, info) => {  
    console.log(info);
    console.error(err);
  });

  console.log("new profile image:", req.body.user, newImageDir);

  await usersModel.findOneAndUpdate({ username: req.body.user }, { imageDir: newImageDir });
  await res.send({ status: "done" });
});

router.get("/api/users/checkImageAvailability/:username", (req: Request, res: Response) => {
  const { username } = req.params;
  usersModel.findOne({ username })
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
  const { username } = req.params;
  const user: any = await usersModel.findOne({ username });
  await res.download(user.imageDir, "profileImage.png");
};
router.route("/api/users/profilePicture/:username").get(handleDownload).post(handleDownload);

module.exports = router;
// export default router;