var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var packetBoxSchema = new Schema({
	'name' : String,
	'location': {
		type: {
		type: String,
		enum: ['Point'],
		default: 'Point'
		},
		coordinates: {
		type: [Number],  // [longitude, latitude]
		default: undefined
		}
	},
	'books': [{ type: Schema.Types.ObjectId, ref: 'book' }],
	'packetBoxId':String
});

packetBoxSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('packetBox', packetBoxSchema);
