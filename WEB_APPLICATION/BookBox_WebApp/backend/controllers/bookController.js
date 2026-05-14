var BookModel = require('../models/bookModel.js');
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
    const { title, author, glossary, genre } = req.body;
    if(!title || !author || !genre){
        return res.status(500).json({ message: "Missing input" });
    }
    try {
        var book = new BookModel({
			title : title,
            path: "/images/" + (req.file? req.file.filename: "1ef969c2acb1d69ffad3f5a19b5833f4"),
			author : author,
			glossary : glossary,
			genre : genre
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
    remove: function (req, res) {
        var id = req.params.id;

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
    }
};
