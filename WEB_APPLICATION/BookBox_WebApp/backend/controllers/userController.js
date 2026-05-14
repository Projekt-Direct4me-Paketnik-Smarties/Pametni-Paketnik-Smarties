const UserModel = require('../models/User.js');
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
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
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
    login: function(req, res, next){
        try{
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                return res.status(500).json({ message:"Error logging in" });
            }
            req.session.userId = user._id;
            //res.redirect('/users/profile');
            return res.json(user);
        });
        }catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
            
        }
    },

    logout: function(req, res, next){
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else{
                    return res.status(201).json({});
                }
            });
        }
    }
}