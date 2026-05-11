const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    parcelLocker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParcelLocker',
    },
    reservedUntil: {
        type: date,
        required: true, 
    },
},
{ timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);