// @ts-nocheck
import express, { Request, Response, NextFunction, Router } from "express";
import Message from "../models/message.model.cjs";

import { addToMongoose } from "../ts/msgOperations.cjs";

import bp from "body-parser";

const multer = require("multer"); // for file uploading
const upload = multer({ dest: "uploads" });

const router: Router = express.Router();

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/", (req: Request, res: Response) => {
  Message.find()
    .then((message: any) => res.json(message))
    .catch((err: string) => res.status(400).json(`Error: ${err}`));
});

router.post("/add/:category/:id", () => {});

router.delete("/:messageId", (req: Request, res: Response) => {
  const id = req.params.messageId;
  Message.remove({
    _id: id,
  })
    .exec()
    .then((result: any) => res.status(200).json(result))
    .catch((err: any) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/:messageId", (req: Request, res: Response) => {
  const id = req.params.messageId;
  const message = req.body.message;

  Message.update(
    {
      _id: id,
    },
    {
      $set: {
        message: message,
      },
    }
  )
    .exec();
});

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  const realFileData = {
    isFile: true,
    username: req.body.user,
    originalName: req.body.fileName,
    path: req.file.path, // @ts-ignore
    room: req.body.room,
    roomId: req.body.roomId,
    datetime: req.body.datetime,
    size: req.body.size,
  };

  // console.log("data:", req.body);
  // console.log("path:", req.file.path);
  await addToMongoose(realFileData);
  await res.send("done");
  console.log("uploaded");
});

const handleD = async (req: Request, res: Response) => {
  // res.send(req.params.id);
  const file: any = await Message.findById(req.params.id);
  file.downloadCount++;
  // console.log("count:", file.downloadCount);
  await file.save();
  await res.download(file.path, file.originalName);
};
router.route("/file/:id").get(handleD).post(handleD);

module.exports = router;
// export default router;