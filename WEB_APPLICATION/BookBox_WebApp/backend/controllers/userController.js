const UserModel = require('../models/User.js');
module.exports = {

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