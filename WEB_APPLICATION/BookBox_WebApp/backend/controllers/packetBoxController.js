const PacketboxModel = require('../models/packetBoxModel.js');
const BookModel = require('../models/bookModel.js');

module.exports = {
    list: function (req, res) {
        PacketboxModel.find(function (err, paketBoxs) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting paketBox.',
                    error: err
                });
            }

            return res.json(paketBoxs);
        });
    },

    show: function (req, res) {
        var id = req.params.id;

        PacketboxModel.findOne({_id: id}, function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Box.',
                    error: err
                });
            }

            if (!paketBox) {
                return res.status(404).json({
                    message: 'No such Box'
                });
            }

            return res.json(paketBox);
        });
    },
    create: function (req, res) {
        const {name, longitude, latitude } = req.body;
        
    try {
        var paketBox = new PacketboxModel({
			name : name,
            location: longitude && latitude ? {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            } : undefined

        });
        console.log(paketBox)
        paketBox.save(function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Box',
                    error: err
                });
            }

            return res.status(201).json(paketBox);
        });}
        catch(err){
            console.error(err);
            res.status(500).json({ message: err.message }); 
        }
    },
    update: function (req, res) {
        const id = req.params.id;
        const {name, longitude, latitude } = req.body;

        PacketboxModel.findOne({_id: id}, function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting paketBox',
                    error: err
                });
            }

            if (!paketBox) {
                return res.status(404).json({
                    message: 'No such paketBox'
                });
            }

            paketBox.name = name ? name : paketBox.name;
            paketBox.location= longitude && latitude ? {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            } : paketBox.location

			
            paketBox.save(function (err, paketBox) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating paketBox.',
                        error: err
                    });
                }

                return res.json(paketBox);
            });
        });
    },

    remove: async function (req, res) {
        try{
        var id = req.params.id;
        //this should be a transaction
        await BookModel.updateMany(
            { packetBox: id },
            { $unset: { packetBox: "" } }
        );
        PacketboxModel.findByIdAndRemove(id, function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the paketBox.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
    catch(err){
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    addNewBooks: async function(req,res){
        try {
            const id = req.params.id;
            let newBooks = req.body.books;

            if (!Array.isArray(newBooks)) {
                newBooks = [newBooks];
            }

            const box = await PacketboxModel.findByIdAndUpdate(
                id,
                { $addToSet: { books: { $each: newBooks } } }, //$addToSet does not add duplicates
                { new: true } // returns the new array not old
            );

            if (!box) return res.status(404).json({ message: 'box not found' });


            await BookModel.updateMany(//give the books a reference to which container they're in
                { _id: { $in: newBooks } },
                { $set: { packetBox: id } }
            );

            return res.json({});
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
};
