const mongoose = require('mongoose');

const parcelLockerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
},
{ timestamps: true }
);

exports = mongoose.model('ParcelLocker', parcelLockerSchema);