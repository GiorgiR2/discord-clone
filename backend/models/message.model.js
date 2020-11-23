const mongoose = require('mongoose');

const schema = mongoose.Schema;

const messageSchema = new schema({
    date: {
        type: Date,
        unique: false,
        trim: true,
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
