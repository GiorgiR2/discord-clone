const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: String,
        unique: false,
        trim: true,
        required: [true, 'Please add date'],
    },
    message: {
        type: String,
        unique: false,
        trim: true,
        required: [true, 'Please add a message'],
    },
    user: {
        type: String,
        unique: false,
        trim: true,
        required: [true, 'Please add a username'],
    },
    room: {
        type: String,
        unique: false,
        trim: true,
        required: [true, 'Please add a room name'],
    },
    roomId: {
        type: String,
        trim: true,
        unique: false,
        required: [true, 'Please add a room id'],
    },
},{
    timestamps: false,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;