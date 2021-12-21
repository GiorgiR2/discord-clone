const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        unique: false,
        trim: true,
        required: true,
    },
    message: {
        type: String,
        unique: false,
        trim: true,
        required: true,
    },
    user: {
        type: String,
        unique: false,
        trim: true,
        required: true,
    },
    category: {
        type: String,
        unique: false,
        trim: true,
        required: true,
    }
},{
    timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;