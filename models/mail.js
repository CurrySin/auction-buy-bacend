const mongoose = require('mongoose');

const mailSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    sender: String,
    receiver: String,
    date: String,
    subject: String,
    content: String,
    enroll: Array,
    status: String,
    active: Boolean
});

module.exports = mongoose.model('Mail', mailSchema);