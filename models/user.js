const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
    first_name: String,
    last_name: String,
    phone_number: String,
    dob: String,
    balance: String,
    active: Boolean
});

module.exports = mongoose.model('User', userSchema);