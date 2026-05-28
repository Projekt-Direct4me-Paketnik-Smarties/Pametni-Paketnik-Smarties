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
    const { title, author, glossary, genre, weight } = req.body;
    if(!title || !author || !genre){
        return res.status(500).json({ message: "Missing input" });
    }
    if(!req.session.id){
        return res.status(501).json({ message: "missing user" });
    }
    try {
        console.log(req.session.id)
        var book = new BookModel({
			title : title,
            path: "/images/" + (req.file? req.file.filename: "1ef969c2acb1d69ffad3f5a19b5833f4"),
			author : author,
			glossary : glossary,
			genre : genre,
            weight: weight,
            owner: '6a13583a052ae6a0fd5d9e6c'
        });

        book.save(function (err, book) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating book',
                    error: err
                });
            }

            return res.status(201).json({});
        });
    }catch(err){
        console.error(err);
        res.status(500).json({ message: err.message });
    }
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

    myBooks: async function (req,res){
        const id = req.params.id;
        console.log(id)
        try {
            const books = await BookModel.find({ owner: id });

            if (!books || books.length === 0) {
                return res.status(404).json({ message: 'No books found.' });
            }

            return res.json(books);
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting books.',
                error: err
            });
        }
    }
};
