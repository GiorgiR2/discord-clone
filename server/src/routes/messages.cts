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

// router.post("/add/:category/:id", () => { });

router.delete("/:messageId", (req: Request, res: Response) => {
  const { messageId } = req.params;

  Message.remove({
    _id: messageId,
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
  const { messageId, message } = req.params;

  Message.update(
    {
      _id: messageId,
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
  const room = req.body.room;
  const realFileData = {
    isFile: true,
    username: req.body.user,
    originalName: req.body.fileName, // @ts-ignore
    path: req.file.path,
    room: room,
    roomId: req.body.roomId,
    datetime: req.body.datetime,
    size: req.body.size,
  };

  const _id = await addToMongoose(realFileData);
  await res.send({ status: "done", _id: _id });
  console.log("uploaded");
});

const handleD = async (req: Request, res: Response) => {
  const file: any = await Message.findById(req.params.id);
  await res.download(file.path, file.originalName);
  // file.downloadCount++;
  // await file.save();
};
router.route("/file/:id").get(handleD).post(handleD);

router.route("/emojis/:messageId/:emoji").get((req: Request, res: Response) => {
  const messageId = req.params.messageId;
  const emoji = req.params.emoji;
  // console.log(`received req; id: ${messageId}; emoji: ${emoji}`);

  Message.findById(messageId)
  .then(message => {
    let emojis = message?.emojis;
    emojis?.forEach(el => {
      if (el.emoji == emoji){
        res.send({ users: el.users });
        // console.log("response sent", el.users);
      }
    })
  });
});

module.exports = router;
// export default router;