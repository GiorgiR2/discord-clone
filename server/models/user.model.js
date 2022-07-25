const { kStringMaxLength } = require('buffer');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true,
        minwidth: 3,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        unique: false,
        trim: true,
    },
    status: {
        type: Number, // 1=online, 0=offline
        required: false,
        unique: false,
        trim: false,
    },
    ip: {
        type: String,
        required: false,
        unique: false,
        trim: true,
    }
},{
    timestamp: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;