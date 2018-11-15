const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'products by get method'
    })
});

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: 'products by post method'
    })
});

module.exports = router;