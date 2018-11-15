const express = require('express');
const app = express();

const productRoutes = require('./api/route/products');

app.use('/products', productRoutes);

module.exports = app;