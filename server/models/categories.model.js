const mongoose = require('mongoose');

const categoriesSchema = new monoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    position: {
        type: Number,
        unique: true,
        required: true,
    },
    voice: {
        type: Boolean,
        required: false,
    },
},{
    timestamps: true,
})

const categories = mongoose.model('Categories', categoriesSchema);

module.exports = categories;