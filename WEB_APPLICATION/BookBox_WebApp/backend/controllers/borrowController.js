var BorrowModel = require('../models/borrowModel.js');

module.exports = {

    listAll: async function(req, res) {
        try {
            const borrows = await BorrowModel.find()
                .populate('user')
                .populate('borowedBooks');
            return res.json(borrows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    list: async function(req, res) {
        try {
            const borrows = await BorrowModel.find({ user: req.session.userId })
                .populate('borowedBooks');
            return res.json(borrows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    show: function (req, res) {
        var id = req.params.id;

        BorrowModel.findOne({_id: id}, function (err, borrow) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting borrow.',
                    error: err
                });
            }

            if (!borrow) {
                return res.status(404).json({
                    message: 'No such borrow'
                });
            }

            return res.json(borrow);
        });
    },

    /**
     * borrowController.create()
     */
    create: function (req, res) {
        var borrow = new BorrowModel({
			user : req.body.user,
			packetBox : req.body.packetBox,
			borrowDate : req.body.borrowDate,
			returnDate : req.body.returnDate,
			borrowedBooks : req.body.borrowedBooks
        });

        borrow.save(function (err, borrow) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating borrow',
                    error: err
                });
            }

            return res.status(201).json(borrow);
        });
    },

    /**
     * borrowController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        BorrowModel.findOne({_id: id}, function (err, borrow) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting borrow',
                    error: err
                });
            }

            if (!borrow) {
                return res.status(404).json({
                    message: 'No such borrow'
                });
            }

            borrow.user = req.body.user ? req.body.user : borrow.user;
			borrow.packetBox = req.body.packetBox ? req.body.packetBox : borrow.packetBox;
			borrow.borrowDate = req.body.borrowDate ? req.body.borrowDate : borrow.borrowDate;
			borrow.returnDate = req.body.returnDate ? req.body.returnDate : borrow.returnDate;
			borrow.borrowedBooks = req.body.borrowedBooks ? req.body.borrowedBooks : borrow.borrowedBooks;
			
            borrow.save(function (err, borrow) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating borrow.',
                        error: err
                    });
                }

                return res.json(borrow);
            });
        });
    },

    /**
     * borrowController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        BorrowModel.findByIdAndRemove(id, function (err, borrow) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the borrow.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
