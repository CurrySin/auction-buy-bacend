const mongoose = require('mongoose');

const productShippingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product_id: String,
    title: String,
    sub_title: String,
    name: String,
    type: String,
    category: String,
    sub_category: String,
    price: String,
    quantity: String,
    seller: String,
    buyer: String,
    shipping_address: String,
    shipping_status: String,
    bought_time: String,
    active: Boolean
});

module.exports = mongoose.model('ProductShipping', productShippingSchema);