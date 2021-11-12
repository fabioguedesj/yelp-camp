const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

// isso aqui que adiciona o username e o password
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);