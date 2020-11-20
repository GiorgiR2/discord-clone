const router = require('express').Router();
const Message = require('../models/message.model');

router.route('/').get((req, res) => {
    Message.find()
    .then(message => res.json(message))
    .catch(err => res.status(400).json(`Error: ${err}`));
});

router.route('/add/:category/:id').post(() => {

});

router.route('/').delete(() => {

});
