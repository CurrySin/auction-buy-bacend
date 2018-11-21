const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Product = require('./../../models/product');

router.get('/', (req, res, next) => {
    Product.find().exec().then((doc) => {
        console.log(doc);
        res.status(200).json(doc);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then(result => {
        res.status(200).json({
            message: 'products by get method',
            product: result
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id).exec().then((doc => {
        console.log(doc);
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({ message: 'No valid entry found for provided ID' });
        }
    })).catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
    });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then((result) => {
            res.status(200).json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;