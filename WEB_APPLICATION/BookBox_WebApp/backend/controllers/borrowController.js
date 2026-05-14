const BorrowModel = require('../models/borrowModel.js');
const PacketboxModel = require('../models/packetBoxModel.js');
const BookModel = require('../models/bookModel.js');

module.exports = {

    listPerUser: async function(req, res) {
        try {
            const borrows = await BorrowModel.find()
                .populate('user')
                .populate('books');
            return res.json(borrows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    list: async function(req, res) {
        try {
            const borrows = await BorrowModel.find({ user: req.session.userId })
                .populate('books');
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
    create: async function (req, res) {
        try{
            let bookIds = req.body.books;
            const boxId = req.body.packetBox;
            const userId=req.session.userId;
            if (!Array.isArray(bookIds)) bookIds = [bookIds];

            const books = await BookModel.find({ _id: { $in: bookIds } });
            const unavailable = books.filter(b => b.status !== 'available');
            if (unavailable.length > 0) {
                return res.status(400).json({
                    message: 'Some books are not available',
                    books: unavailable.map(b => b.title)
                });
            }

            // here must put the check that the box was open, get the weight, and then decide if the books' weight
            // is the same as the weight of the chosen books.


            await BookModel.updateMany(
                { _id: { $in: bookIds } },
                { $set: { status: 'borrowed', box: null } }
            );

            // remove books from box
            await PacketboxModel.updateOne(
                { _id: boxId },
                { $pull: { books: { $in: bookIds } } }
            );


            var borrow = new BorrowModel({
                user : userId,
                packetBox : boxId,
                date : Date.now(),
                books : bookIds,
                action: "borrow"
            });

            borrow.save(function (err, borrow) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when borrowing books',
                        error: err
                    });
                }

                return res.status(201).json(borrow);
            });
        }
        catch (err){
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },
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
			borrow.packetBox = req.body.box ? req.body.box : borrow.packetBox;
			borrow.date = req.body.date ? req.body.date : borrow.date;
			borrow.books = req.body.books ? req.body.books : borrow.books;
            borrow.action=req.body.action?req.body.action:borrow.action;
			
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
    },
    returnBooks: async function (req,res) {
        try{
            let bookIds = req.body.books;
            const boxId = req.body.packetBox;
            const userId=req.session.userId;

            if (!Array.isArray(bookIds)) bookIds = [bookIds];
            const books = await BookModel.find({ _id: { $in: bookIds } });
            const available = books.filter(b => b.status !== 'borrowed');
            if (available.length > 0) {
                return res.status(400).json({
                    message: 'Some books are not borrowed',
                    books: available.map(b => b.title)
                });
            }
            // HERE GOES CHECK AND OPENNIGN OF THE SESEMEA, checking weight and all that


            await BookModel.updateMany(
                { _id: { $in: bookIds } },
                { $set: { status: 'available', box: boxId } }
            );

            // remove books from box
            await PacketboxModel.updateOne(
                { _id: boxId },
                { $addToSet: { books: { $each: bookIds } } }
            );

            var borrow = new BorrowModel({
                user : userId,
                packetBox : boxId,
                date : Date.now(),
                books : bookIds,
                action: "return"
            });

            borrow.save(function (err, borrow) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating returning books',
                        error: err
                    });
                }

                return res.status(201).json(borrow);
            });

            
        }
        catch (err){
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }    
    
};
