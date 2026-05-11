    const mongoose = require('mongoose');

    const userShema = new moongoose.Shema({
        firstName: {
            type: string,
            required: true,
            trim: true,
        },
        lastName:{
            type: string,
            required: true,
            trim: true,
        },
        email: {
            type: string,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password:{
            type: string,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userShema);