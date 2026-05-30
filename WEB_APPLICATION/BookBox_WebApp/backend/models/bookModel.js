var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var bookSchema = new Schema({
	'title' : String,
	'path' :{
		type: String,
		default: "images/1ef969c2acb1d69ffad3f5a19b5833f4"//missing png
	}, // for cover
	'author' : String,
	'glossary' : String,
	'genre' : String,
	'status': {
        type: String,
        enum: ['available', 'borrowed', 'owned'],
        default: 'owned',
    },
	'weight':{
		type: Number,
		default: 5
	},
		'packetBox' : {
	 	type: String,
		default: null
	},
	'owner' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'currentBorrower': {
		type: Schema.Types.ObjectId,
		ref: 'user',
		default: null
	},
}, { timestamps: true });

module.exports = mongoose.model('book', bookSchema);
