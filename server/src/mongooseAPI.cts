
import mongoose from "mongoose";

// import usersRoute from "./routes/users.cjs";
// import messagesRoute from "./routes/messages.cjs";
require('dotenv').config();

// import dotenv from "dotenv";
// dotenv.config();

const uri: any = process.env.MONGO_ADDRESS;

mongoose.set('strictQuery', true);
mongoose.connect(uri);