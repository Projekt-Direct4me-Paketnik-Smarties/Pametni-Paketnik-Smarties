var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var reservationSchema = new Schema({
	'user' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'packetBox' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'packetBox'
	},
	'reserveDate' : Date,
	'borrowedDate' : Date,
	'returnDate' : Date,
	'books' : [{ type: Schema.Types.ObjectId, ref: 'book' }]
});

module.exports = mongoose.model('reservation', reservationSchema);
