var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var borrowSchema = new Schema({
	'user' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'packetBox' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'packetBox'
	},
	'date' : Date,
	'books' : [{ type: Schema.Types.ObjectId, ref: 'book' }],
	'action': {
        type: String,
        enum: ['borrow', 'return'],
        default: 'borrow',
    },
});

module.exports = mongoose.model('borrow', borrowSchema);
