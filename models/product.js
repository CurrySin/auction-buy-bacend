const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    sub_title: String,
    image: Array,
    name: String,
    type: String,
    category: String,
    sub_category: String,
    duration: String,
    price: String,
    target_bid: String,
    per_bid: String,
    quantity: String,
    shipping_included: Boolean,
    shipping_info: Array,
    status: String,
    active: Boolean,
    start_time: String,
    end_time: String,
    buyer: String,
    seller: String
});

module.exports = mongoose.model('Product', productSchema);