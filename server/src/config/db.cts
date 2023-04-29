import mongoose from "mongoose";

require('dotenv').config();

const uri: any = process.env.MONGO_ADDRESS;

mongoose.set('strictQuery', true);
mongoose.connect(uri);