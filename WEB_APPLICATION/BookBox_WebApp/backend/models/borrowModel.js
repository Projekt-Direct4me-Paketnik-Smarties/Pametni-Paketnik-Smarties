var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var borrowSchema = new Schema({
	'user' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'packetBox' : String,
	'date' : Date,
	'books' : [{ type: Schema.Types.ObjectId, ref: 'book' }],
	'action': {
        type: String,
        enum: ['borrow', 'return', 'reposes', 'donate'],
        default: 'borrow',
    },
});

module.exports = mongoose.model('borrow', borrowSchema);
