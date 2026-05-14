var PaketboxModel = require('../models/packetBoxModel.js');

/**
 * paketBoxController.js
 *
 * @description :: Server-side logic for managing paketBoxs.
 */
module.exports = {

    /**
     * paketBoxController.list()
     */
    list: function (req, res) {
        PaketboxModel.find(function (err, paketBoxs) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting paketBox.',
                    error: err
                });
            }

            return res.json(paketBoxs);
        });
    },

    /**
     * paketBoxController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        PaketboxModel.findOne({_id: id}, function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting paketBox.',
                    error: err
                });
            }

            if (!paketBox) {
                return res.status(404).json({
                    message: 'No such paketBox'
                });
            }

            return res.json(paketBox);
        });
    },

    /**
     * paketBoxController.create()
     */
    create: function (req, res) {
        var paketBox = new PaketboxModel({
			name : req.body.name
        });

        paketBox.save(function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating paketBox',
                    error: err
                });
            }

            return res.status(201).json(paketBox);
        });
    },

    /**
     * paketBoxController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        PaketboxModel.findOne({_id: id}, function (err, paketBox) {
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

            paketBox.name = req.body.name ? req.body.name : paketBox.name;
			
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

    /**
     * paketBoxController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        PaketboxModel.findByIdAndRemove(id, function (err, paketBox) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the paketBox.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
