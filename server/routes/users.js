const express = require('express');
const bp = require('body-parser');

const router = express.Router();

const ops = require('../js/operations.js');

router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Handling GET requests to /users...'
    });
});

router.post('/api/users/register', (req, res) => {
    let username = req.body.username;
    let password0 = req.body.password0;
    let password1 = req.body.password1;

    ops.registerUser(username, password0, password1, res);
});

router.post('/api/users/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    
    ops.checkLogin(username, password, req, res);
});

router.post('/api/users/logout', (req, res) => {
    ops.removeIp(req, res);
});

router.post('/api/users/status', (req, res) => {
    ops.checkIp(req, res);
});

module.exports = router;