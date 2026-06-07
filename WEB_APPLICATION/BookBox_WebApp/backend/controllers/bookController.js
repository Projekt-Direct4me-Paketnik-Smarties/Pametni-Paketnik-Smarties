const BookModel = require('../models/bookModel.js');
const PacketBoxModel = require('../models/packetBoxModel.js')
var fs = require('fs');
var path = require('path');

module.exports = {

    list: function (req, res) {
        BookModel.find(function (err, books) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting book.',
                    error: err
                });
            }

            return res.json(books);
        });
    },

    show: function (req, res) {
        const id = req.params.id;

        BookModel.findOne({_id: id}, function (err, book) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting book.',
                    error: err
                });
            }

            if (!book) {
                return res.status(404).json({
                    message: 'No such book'
                });
            }

            return res.json(book);
        });
    },

    create: function (req, res) {
        console.log("asd")
        const { title, author, glossary, genre, weight } = req.body;
        if (!title || !author || !genre) {
            return res.status(400).json({ message: "Missing input" });
        }
        var book = new BookModel({
            title, author, glossary, genre, weight,
            path: "/images/" + (req.file ? req.file.filename : "1ef969c2acb1d69ffad3f5a19b5833f4"),
            owner: req.user.id  // ← from JWT instead of hardcoded
        });
        book.save(function (err, book) {
            if (err) return res.status(500).json({ message: 'Error when creating book', error: err });
            return res.status(201).json({});
        });
    },

    /**
     * bookController.update()
     */
    update: function (req, res) {
        const id = req.params.id;
        console.log(id)

        BookModel.findOne({_id: id}, function (err, book) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting book',
                    error: err
                });
            }

            if (!book) {
                return res.status(404).json({
                    message: 'No such book'
                });
            }
            //here check that book path isnt default.
            if(req.file){
                if(book.path!="/images/1ef969c2acb1d69ffad3f5a19b5833f4" )
                try {
                    fs.unlinkSync(path.join(__dirname,'../public',book.path));
                } catch(err) {
                    console.error(err);
                    return res.status(500).json({ message: err.message });
                }
                book.path = "/images/"+req.file.filename 
            }

            book.title = req.body.title ? req.body.title : book.title;
			book.author = req.body.author ? req.body.author : book.author;
			book.glossary = req.body.glossary ? req.body.glossary : book.glossary;
			book.genre = req.body.genre ? req.body.genre : book.genre;
            book.weight=req.body.weight? req.body.weight:book.weight;
			
            book.save(function (err, book) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating book.',
                        error: err
                    });
                }

                return res.status(200).json({});
            });
        });
    },

    /**
     * bookController.remove()
     */
    remove: async function (req, res) {
        var id = req.params.id;
        await PacketBoxModel.updateMany( //remove them from any list they may be in
            { books: id },
            { $pull: { books: id } }
        );

        BookModel.findByIdAndRemove(id, function (err, book) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the book.',
                    error: err
                });
            }
            if(book.path!="/images/1ef969c2acb1d69ffad3f5a19b5833f4"){
                try {
                    fs.unlinkSync(path.join(__dirname,'../public',book.path));
                } catch(err) {
                    console.error(err);
                }

            }

            return res.status(204).json();
        });
    },

    requestReturn: async function (req, res) {
        const id = req.params.id;
        try {
            const book = await BookModel.findOne({ _id: id });
            if (!book) {
                return res.status(404).json({ message: 'No such book' });
            }
            if (!book.owner || book.owner.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Only the owner can request the return of this book.' });
            }
            if (book.status !== 'available') {
                return res.status(400).json({ message: 'This book is not currently sitting in a packet box.' });
            }

            book.returnRequestedAt = new Date();
            await book.save();
            return res.json(book);
        } catch (err) {
            return res.status(500).json({ message: 'Error when requesting book return.', error: err });
        }
    },

    myBooks: async function (req, res) {
        const id = req.user.id;
        try {
            const books = await BookModel.find({ owner: id });
            if (!books || books.length === 0) {
                return res.status(404).json({ message: 'No books found.' });
            }
            return res.json(books);
        } catch (err) {
            return res.status(500).json({ message: 'Error when getting books.', error: err });
        }
    }
};
