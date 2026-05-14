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
	'borrowDate' : Date,
	'returnDate' : Date,
	'borrowedBooks' : [{ type: Schema.Types.ObjectId, ref: 'book' }]
});

module.exports = mongoose.model('borrow', borrowSchema);
