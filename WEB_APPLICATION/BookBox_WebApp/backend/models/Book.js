const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    genre: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'reserved' ,'borrowed'],
        default: 'available',
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    parcelLocker: {
        type: mongoose.Schema.Typer.ObjectId,
        ref: 'ParcelLocker',
    },
},
{ timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);