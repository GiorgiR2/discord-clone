const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config(); // variables

// express server
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// mongodb
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true });

const connection = mongoose.connect;
connection.once('open', () => {
    console.log("Succesfully established connection with mongodb connection");
});

// require models
const usersRouter = require('./route/users');
const messagesRouter = require('./route/messages');
app.use('users', usersRouter);
app.use('messages', messagesRouter);

// listen
app.listen(port, () => {
    console.log(`Server is fcking listening on port ${port}...`);
});
