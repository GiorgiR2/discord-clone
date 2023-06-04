import express, { Request, Response, Router } from "express";
import bp from "body-parser";
import sharp from "sharp";

const multer = require("multer"); // for file uploading
const upload = multer({ dest: "profile_pictures" });

const router: Router = express.Router();

import { registerUser, checkLogin, checkData, addIp, getUserHash } from "../ts/userOperations.cjs";

import usersModel from "../models/user.model.cjs";
import deletedUserModel from "../models/deletedUser.model.cjs";
import getIp from "../scripts/getIp.cjs";
import saveModel from "../ts/saveModel.cjs";
import { isAuth } from "./middleware/authentication.cjs";

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET requests to /users...",
  });
});

router.post("/api/users/register", async (req: Request, res: Response) => {
  const { username, hashedPassword } = req.body;
  const ip = getIp(req);

  const {success, data} = await registerUser(username, hashedPassword, ip);
  res.send({ success, data });
});

router.post("/api/users/login", async (req: Request, res: Response) => {
  const ip = getIp(req);

  const { username, hashedPassword } = await req.body;

  const data = await checkLogin(username, hashedPassword);

  if (data.success) {
    await addIp(username, ip);
    await res.send(data);
  } else {
    res.send({ success: false, status: "412 Precondition Failed" });
  }
});

router.get("/api/users/:hashId", async (req: Request, res: Response) => {
  try {
    const { hashId } = req.params;

    const data = await checkData(hashId);
    await res.send(data);
  } catch {
    await res.send({ success: false });
  }
});

router.get("/api/users/usernameByHashId/:hashId", async (req: Request, res: Response) => {
  const { hashId } = req.params;
  const user = await usersModel.find({ hashId }).exec();
  await res.send({ username: user[0].username });
});

router.post("/api/users/changePassword", isAuth, async (req: Request, res: Response) => {
  const { username, oldPassword, newPassword } = req.body;

  const filter = { username: username };
  const user = await usersModel.findOne(filter);
  if (user?.password === oldPassword && user !== null) {
    user.password = newPassword;
    res.send({ success: true });
  }
  else {
    res.send({ success: false });
  }
  await user!.save();
});

router.post("/api/users/deleteAccount", isAuth, async (req: Request, res: Response) => {
  const { authentication, username } = req.body;
  console.log(`deleting account: ${authentication}; username: ${username}`);

  usersModel.findOneAndDelete({ username }).exec();

  let newDeletedUserModel = new deletedUserModel({
    username,
    ip: getIp(req),
  });
  saveModel(newDeletedUserModel);

  res.send({ success: true });
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
        res.send({ success: true });
      }
      else {
        console.log("exist", user.imageDir);
        res.send({ success: false });
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