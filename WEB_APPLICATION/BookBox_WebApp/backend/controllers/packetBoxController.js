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
        const {name, longitude, latitude, address } = req.body;

    try {
        var paketBox = new PacketboxModel({
			name : name,
            address: address,
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
        const {name, longitude, latitude, address } = req.body;

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
            paketBox.address = address ? address : paketBox.address;
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
    try {
        const id = req.params.id;

        // TODO: wrap in a MongoDB transaction
        const packetBox = await PacketboxModel.findByIdAndDelete(id);

        if (!packetBox) {
            return res.status(404).json({
                message: 'PacketBox not found'
            });
        }

        await BookModel.updateMany(
            { packetBox: packetBox._id },
            {
                $unset: { packetBox: "" },
                $set: { status: "owned" }
            }
        );

        return res.sendStatus(204);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: 'Error when deleting the packetBox.',
            error: err.message
        });
    }
    },
    listPerPacketBox: async function(req, res) {
        try {
            const packetBox = req.params.packetBox;

            const borrows = await BorrowModel.find({
                packetBox: packetBox
            })
            .sort({ date: -1 })
            .populate('user')
            .populate('books');

            return res.json(borrows);
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                message: err.message
            });
        }
    },
};
