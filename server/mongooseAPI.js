
const mongoose = require("mongoose");

const usersRoute = require("./routes/users");
const messagesRoute = require("./routes/messages");

require('dotenv').config();

const uri = process.env.MONGO_ADDRESS;

mongoose.connect(uri);
