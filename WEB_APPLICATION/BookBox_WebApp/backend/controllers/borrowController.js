const BorrowModel = require('../models/borrowModel.js');
const PacketboxModel = require('../models/packetBoxModel.js');
const BookModel = require('../models/bookModel.js');
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;

module.exports = {
    list: async function(req, res) {
        try {
            const borrows = await BorrowModel.find()
                .sort({ date: -1 })
                .populate('user')
                .populate('books');

            return res.json(borrows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    listPerUser: async function(req, res) {
        try {
            const borrows = await BorrowModel.find({ user: req.user.id })
                .sort({ date: -1 })
                .populate('books');

            return res.json(borrows);
        } catch (err) {
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
    borrowBooks: async function (req, res) {
        try{
            let bookIds = req.body.books;
            const boxId = req.body.packetBox;
            const userId = req.user.id;
            if (!Array.isArray(bookIds)) bookIds = [bookIds];

            const books = await BookModel.find({ _id: { $in: bookIds } });
            const unavailable = books.filter(b => b.status !== 'available');
            if (unavailable.length > 0) {
                return res.status(400).json({
                    message: 'Some books are not available',
                    books: unavailable.map(b => b.title)
                });
            }

            await BookModel.updateMany(
                { _id: { $in: bookIds } },
                {
                    $set: {
                        status: 'borrowed',
                        currentBorrower: userId,
                        packetBox: ""
                    }
                }
            );

            // remove books from box
            await PacketboxModel.updateOne(
                { packetBoxId: boxId },
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
            const userId = req.user.id;

            if (!Array.isArray(bookIds)) bookIds = [bookIds];
            const books = await BookModel.find({ _id: { $in: bookIds } });
            const invalidBooks = books.filter(
                b =>
                    b.status !== 'borrowed' ||
                    !b.currentBorrower?.equals(userId)
            );

            if (invalidBooks.length > 0) {
                return res.status(400).json({
                    message: 'Some books are not borrowed by this user',
                    books: invalidBooks.map(b => b.title)
                });
            }


            await BookModel.updateMany(
                { _id: { $in: bookIds } },
                {
                    $set: {
                        status: 'available',
                        packetBox: boxId
                    },
                    $unset: {
                        currentBorrower: ""
                    }
                }
            );

            // remove books from box
            await PacketboxModel.updateOne(
                { packetBoxId: boxId },
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
    },

    donateBooks: async function (req,res) {
        try{
            let bookIds = req.body.books;
            const boxId = req.body.packetBox;
            const userId = req.user.id;
            console.log("boxId: "+boxId)
            if (!Array.isArray(bookIds)) bookIds = [bookIds];
            const books = await BookModel.find({ _id: { $in: bookIds } });
            const available = books.filter(b => b.status !== 'owned');
            if (available.length > 0) {
                return res.status(400).json({
                    message: 'Some books are not in your possesion',
                    books: available.map(b => b.title)
                });
            }
            console.log("all books available")

            await BookModel.updateMany(
                { _id: { $in: bookIds } },
                { $set: { status: 'available', packetBox: boxId } }
            );

            console.log("books updated")
            await PacketboxModel.updateOne(
                { packetBoxId: boxId },
                { $addToSet: { books: { $each: bookIds } } }
            );

            console.log("packetBox Updated")
            var borrow = new BorrowModel({
                user : userId,
                packetBox : boxId,
                date : Date.now(),
                books : bookIds,
                action: "donate"
            });

            console.log("borrow created")
            borrow.save(function (err, borrow) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating donate books',
                        error: err
                    });
                }

                return res.status(201).json(borrow);
            });

            console.log("borrow saved")
            
        }
        catch (err){
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    reposesBooks: async function (req,res) {
        try{
            let bookIds = req.body.books;
            const boxId = req.body.packetBox;
            const userId = req.user.id;

            if (!Array.isArray(bookIds)) bookIds = [bookIds];
            const books = await BookModel.find({ _id: { $in: bookIds } });
            const available = books.filter(
                b => b.status !== 'available' || !b.owner.equals(userId)
            );
            if (available.length > 0) {
                return res.status(400).json({
                    message: 'Some books are not available to reposes',
                    books: available.map(b => b.title)
                });
            }

            await BookModel.updateMany(
                { _id: { $in: bookIds } },
                { $set: { status: 'owned', packetBox: "" } }
            );

            // remove books from box
            await PacketboxModel.updateOne(
                { packetBoxId: boxId },
                { $pull: { books: { $in: bookIds } } }
            );

            var borrow = new BorrowModel({
                user : userId,
                packetBox : boxId,
                date : Date.now(),
                books : bookIds,
                action: "reposes"
            });

            borrow.save(function (err, borrow) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when reposesing books',
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
    
    checkOverdue: async function() {
    const cutoff = new Date(Date.now() - TWO_WEEKS);
    const overdueBooks = await BookModel.find({
        status: 'borrowed',
        updatedAt: { $lt: cutoff }
    });
    for (const book of overdueBooks) {
        console.log(`OVERDUE: book "${book.title}" (${book._id})`);
    }
    },
};
