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
        enum: ['available', 'borrowed'],
        default: 'available',
    },
	'weight':{
		type: Number,
		default: 5
	},
		'packetBox' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'packetBox'
	},
	'owner' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	}
}, { timestamps: true });

module.exports = mongoose.model('book', bookSchema);
