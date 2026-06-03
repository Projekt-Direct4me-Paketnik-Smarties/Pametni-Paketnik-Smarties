const UserModel = require('../models/User.js');
const BorrowModel = require('../models/borrowModel.js');
const BookModel = require('../models/bookModel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const RefreshTokenModel = require('../models/refreshTokenModel.js');
const fs = require('fs');
const fetch = require('node-fetch');
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';


function sanitizeUser(user) {
    return { id: user._id, username: user.username, email: user.email };
}
function signAccessToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: process.env.JWT_EXP || '1h' });
}
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}
module.exports = {

    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting users.',
                    error: err
                });
            }

            return res.json(users);
        });
    },
    show: async function (req, res) {
        try {
            const userId = req.params.id;

            const [user, borrowRecords, currentlyBorrowed] = await Promise.all([
                UserModel.findById(userId),

                BorrowModel.find({
                    user: userId,
                    action: 'borrow'
                }).select('books'),

                BookModel.countDocuments({
                    currentBorrower: userId
                })
            ]);

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            const booksBorrowed = borrowRecords.reduce(
                (total, record) => total + record.books.length,
                0
            );

            return res.json({
                username: user.username,
                email: user.email,
                booksBorrowed,
                currentlyBorrowed
            });

        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting user.',
                error: err.message
            });
        }
    },
    create: async function (req, res) {
        try{
        const { email, username, password } = req.body;
        var user = new UserModel({
			username : req.body.username,
			password : req.body.password,
			email : req.body.email
        });
        const existing = await UserModel.findOne({ $or: [{ email: email }, { username: username }] });
        if (existing) {
            return res.status(501).json({ message: "Username or email already exists" });
        }

        user.save(function (err, user) {
            if (err) {
                return res.status(502).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.status(200).json({});
        });
        }catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }
            console.log("password: "+req.body.password)

            user.username = req.body.username ? req.body.username : user.username;
			user.password = req.body.password ? req.body.password : user.password;
			user.email = req.body.email ? req.body.email : user.email;
			
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({ message: 'Error when deleting the user.', error: err });
            }
            req.session.destroy(function(err) {
                if(err) return res.status(500).json({ message: "Error destroying session" });
                return res.status(200).json({});
            });
        });
    },
    login: async function (req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password)
                return res.status(400).json({ message: 'username and password are required' });

            const user = await UserModel.findOne({ username });
            if (!user) return res.status(401).json({ message: 'No such user' });

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(401).json({ message: 'Wrong password' });

            const accessToken = signAccessToken(user);
            const refreshToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TTL_DAYS || '30') * 24 * 60 * 60 * 1000));
            await RefreshTokenModel.create({ user: user._id, tokenHash: hashToken(refreshToken), expiresAt });

            return res.status(200).json({ accessToken, refreshToken, user: sanitizeUser(user) });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    logout: async function (req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });
            await RefreshTokenModel.deleteOne({ tokenHash: hashToken(refreshToken) });
            return res.status(200).json({ message: 'Logged out' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    refresh: async function (req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });

            const record = await RefreshTokenModel.findOne({ tokenHash: hashToken(refreshToken) });
            if (!record || record.expiresAt < new Date())
                return res.status(401).json({ message: 'Invalid refresh token' });

            const user = await UserModel.findById(record.user);
            if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

            return res.status(200).json({ accessToken: signAccessToken(user) });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    image_2FA: async function (req,res){
    try {
        console.log("flask url: ", FLASK_URL)
        console.log("sending fetch")
        const flaskRes = await fetch(`${FLASK_URL}/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_path: req.file.path })
        });
        console.log("recieving response")

        const { match } = await flaskRes.json();

        fs.unlinkSync(req.file.path);

        if (!match) {
            return res.status(401).json({ message: 'Face not recognized' });
        }

        // find the admin user after face is confirmed
        const user = await UserModel.findOne({ username: 'admin' });
        if (!user) return res.status(404).json({ message: 'Admin user not found' });

        const accessToken = signAccessToken(user);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_TTL_DAYS || '30') * 24 * 60 * 60 * 1000));
        await RefreshTokenModel.create({ user: user._id, tokenHash: hashToken(refreshToken), expiresAt });

        return res.status(200).json({ accessToken, refreshToken, user: sanitizeUser(user) });

    } catch (err) {
        console.log("ERROR: ", err)
        if (req.file) fs.unlinkSync(req.file.path);  // cleanup on error
        res.status(500).json({ message: err.message });
    }
}
}