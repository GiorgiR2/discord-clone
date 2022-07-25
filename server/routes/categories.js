const express = require('express');
const bp = require('body-parser');

const Categories = require('../models/categories.model');
const { saveModel } = require('../js/saveModel');

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Handling GET requests to /users...'
    });
});

router.post('/api/roomId', async (req, res) => {
    try {
        let name = await Categories.find({
            _id: req.body.id
        }).exec();
    
        await res.send({
            roomName: name[0].name,
            voiceMode: name[0].voice,
        });
        console.log("sent", name[0].name);
    }
    catch {
        await res.send({ roomName: "try_again" });
    }
});

router.post('/api/editCat', async (req, res) => {
    const catId = req.body.catId;
    const newCatName = req.body.newCatName;

    // console.log("catId:", catId);
    // console.log("newCatName:", newCatName);
    try {
        await Categories.updateOne({
            _id: catId
        },
        {
            $set: {
                name: newCatName
            }
        });

        await res.send({ status: "done" });
    }
    catch {
        await res.send({ status: "try again" });
    }
});

router.post('/api/addCat', (req, res) => {
    const newCatName = req.body.newCatName;

    let newCat = new Categories({
        _id: new mongoose.Types.ObjectId(),
    })
});

router.post('/getdata', (req, res) => {
    // pass
});

router.post('/addcategory', (req, res) => {
    // pass
});

router.post('/move', (req, res) => {
    // pass
});

router.delete('/remove', (req, res) => {
    // pass
});

module.exports = router;