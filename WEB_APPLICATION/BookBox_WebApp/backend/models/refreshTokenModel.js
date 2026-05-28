var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RefreshTokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
