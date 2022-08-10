const mongoose = require('mongoose')

const User = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        require: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
    },
    subscribed: {
        type: Boolean,
        required: true
    },
    verified: {
        type: Boolean,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    countryCode: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model("user", User)