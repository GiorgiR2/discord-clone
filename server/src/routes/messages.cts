import express, { Request, Response, Router } from "express";
import MessageModel, { messageSchemaI } from "../models/message.model.cjs";

import { addToMongoose } from "../ts/msgOperations.cjs";

import bp from "body-parser";

const multer = require("multer"); // for file uploading
const upload = multer({ dest: "uploads" });

const router: Router = express.Router();

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/", (req: Request, res: Response) => {
  MessageModel.find()
    .then((message: any) => res.json(message))
    .catch((err: string) => res.status(400).json(`Error: ${err}`));
});

router.delete("/:messageId", (req: Request, res: Response) => {
  const { messageId } = req.params;

  MessageModel.remove({
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

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  const { room, roomId, user, fileName, datetime, size } = req.body;

  // @ts-ignore
  const path = req.file.path;

  const realFileData = {
    isFile: true,
    username: user,
    originalName: fileName,
    path,
    room,
    roomId,
    datetime,
    size,
  };

  const _id = await addToMongoose(realFileData);
  await res.send({ status: "done", _id: _id });
  console.log("uploaded");
});

const handleD = async (req: Request, res: Response) => {
  const file: any = await MessageModel.findById(req.params.id);
  await res.download(file.path, file.originalName);
  // file.downloadCount++;
  // await file.save();
};
router.route("/file/:id").get(handleD).post(handleD);

router.route("/emojis/:messageId/:emoji").get((req: Request, res: Response) => {
  const { messageId, emoji } = req.params;
  // console.log(`received req; id: ${messageId}; emoji: ${emoji}`);

  MessageModel.findById(messageId)
    .then(message => {
      let emojis = message?.emojis;
      emojis?.forEach(el => {
        if (el.emoji == emoji) {
          res.send({ users: el.users });
          // console.log("response sent", el.users);
        }
      })
    });
});

router.route("/moreMessages/:room/:timesReceived").get((req: Request, res: Response) => {
  const { room, timesReceived } = req.params;
  const skipN = 15+5*parseInt(timesReceived);

  MessageModel.find({ room })
    .sort({ number: -1 })
    .limit(5)
    .skip(skipN)
    .exec()
    .then((doc: messageSchemaI[]) => {
      res.send({ messages: doc });
    });
});

module.exports = router;
// export default router;