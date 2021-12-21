const express = require('express');
const bp = require('body-parser');

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Handling GET requests to /users...'
    });
});

router.post('/addcategory', (req, res) => {
    // pass
});

router.post('/move', (req, res) => {
    // pass
});
