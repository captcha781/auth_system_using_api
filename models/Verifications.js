const mongoose = require('mongoose')

const Verification = mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    validity: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("verification",Verification)