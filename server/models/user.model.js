const mongoose = require('mongoose');

const schema = mongoose.schema;

const userSchema = new schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minwidth: 3,
    },
    role: {
        type: String,
        required: false,
        unique: false,
        trim: false
    }
},{
    timestamp: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
