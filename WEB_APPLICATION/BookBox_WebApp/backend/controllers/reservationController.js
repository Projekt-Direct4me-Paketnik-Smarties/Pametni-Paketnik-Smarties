var ReservationModel = require('../models/reservationModel.js');

/**
 * reservationController.js
 *
 * @description :: Server-side logic for managing reservations.
 */
module.exports = {

    /**
     * reservationController.list()
     */
    list: function (req, res) {
        ReservationModel.find(function (err, reservations) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting reservation.',
                    error: err
                });
            }

            return res.json(reservations);
        });
    },

    /**
     * reservationController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        ReservationModel.findOne({_id: id}, function (err, reservation) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting reservation.',
                    error: err
                });
            }

            if (!reservation) {
                return res.status(404).json({
                    message: 'No such reservation'
                });
            }

            return res.json(reservation);
        });
    },

    /**
     * reservationController.create()
     */
    create: function (req, res) {
        var reservation = new ReservationModel({
			user : req.body.user,
			packerBox : req.body.packerBox,
			reserveDate : req.body.reserveDate,
			borrowedDate : req.body.borrowedDate,
			returnDate : req.body.returnDate,
			books : req.body.books
        }); //make sure to update book status

        reservation.save(function (err, reservation) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating reservation',
                    error: err
                });
            }

            return res.status(201).json(reservation);
        });
    },

    /**
     * reservationController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        ReservationModel.findOne({_id: id}, function (err, reservation) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting reservation',
                    error: err
                });
            }

            if (!reservation) {
                return res.status(404).json({
                    message: 'No such reservation'
                });
            }

            reservation.user = req.body.user ? req.body.user : reservation.user;
			reservation.packerBox = req.body.packerBox ? req.body.packerBox : reservation.packerBox;
			reservation.reserveDate = req.body.reserveDate ? req.body.reserveDate : reservation.reserveDate;
			reservation.borrowedDate = req.body.borrowedDate ? req.body.borrowedDate : reservation.borrowedDate;
			reservation.returnDate = req.body.returnDate ? req.body.returnDate : reservation.returnDate;
			reservation.books = req.body.books ? req.body.books : reservation.books;
			
            reservation.save(function (err, reservation) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating reservation.',
                        error: err
                    });
                }

                return res.json(reservation);
            });
        });
    },

    /**
     * reservationController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        ReservationModel.findByIdAndRemove(id, function (err, reservation) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the reservation.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
