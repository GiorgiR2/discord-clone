const express = require('express');
const Message = require('../models/message.model');

const bp = require('body-parser');

const multer = require('multer'); // for file uploading

const upload = multer({ dest: "uploads" });

const router = express.Router();

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    Message.find()
    .then(message => res.json(message))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

router.post('/add/:category/:id', () => {

});

router.delete('/:messageId', (req, res, next) => {
    const id = req.params.messageId;
    Message.remove({
        _id: id
    })
    .exec()
    .then(result => res.status(200).json(result))
    .catch(err => {
        console.log(err);
        re.status(500).json({
            error: err
        });
    });
});

router.patch('/:messageId', (req, res, next) => {
    const id  = req.params.messageId;
    const message = req.body.message;
    Message.update({
        _id: id,
    },
    {
        $set: {
            message: message
        }
    })
    .exec()
    .then()
    .catch();
});

router.post("/file", upload.single("file"), async (req, res) => {
    //
});

module.exports = router;