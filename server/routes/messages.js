const express = require("express");
const Message = require("../models/message.model");

const msgOps = require("../js/msgOperations");

const bp = require("body-parser");

const multer = require("multer"); // for file uploading
const upload = multer({ dest: "uploads" });

const router = express.Router();

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  Message.find()
    .then((message) => res.json(message))
    .catch((err) => res.status(400).json(`Error: ${err}`));
});

router.post("/add/:category/:id", () => {});

router.delete("/:messageId", (req, res, next) => {
  const id = req.params.messageId;
  Message.remove({
    _id: id,
  })
    .exec()
    .then((result) => res.status(200).json(result))
    .catch((err) => {
      console.log(err);
      re.status(500).json({
        error: err,
      });
    });
});

router.patch("/:messageId", (req, res, next) => {
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
    .exec()
    .then()
    .catch();
});

router.post("/upload", upload.single("file"), async (req, res) => {
  const realFileData = {
    isFile: true,
    username: req.body.user,
    originalName: req.body.fileName,
    path: req.file.path,
    room: req.body.room,
    roomId: req.body.roomId,
    datetime: req.body.datetime,
    size: req.body.size,
  };

  // console.log("data:", req.body);
  // console.log("path:", req.file.path);
  await msgOps.addToMongoose(realFileData);
  await res.send("done");
});

// router.post("/file:id", async (req, res) => {
//   const id = req.params.id.substr(1);
//   console.log("!!!!!!!!!!!!!!!!!!!!!!!!!", id);

//   const file = await Message.findById(id);

//   file.downloadCount++;
//   await file.save();
//   // console.log(file.downloadCount);

//   await res.download(file.path, file.originalName);
// });

const handleD = async (req, res) => {
  // res.send(req.params.id);
  const file = await Message.findById(req.params.id);

  file.downloadCount++;
  console.log("count:", file.downloadCount);
  await file.save();

  await res.download(file.path, file.originalName);
};
router.route("/file/:id").get(handleD).post(handleD);

module.exports = router;
