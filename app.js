const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/route/products');
const userRoutes = require('./api/route/user');

mongoose.connect('mongodb://currysin:' + process.env.MONGO_ATLAS_PW + '@acutionorbuydb-shard-00-00-vvdn3.mongodb.net:27017,acutionorbuydb-shard-00-01-vvdn3.mongodb.net:27017,acutionorbuydb-shard-00-02-vvdn3.mongodb.net:27017/test?ssl=true&replicaSet=AcutionOrBuyDB-shard-0&authSource=admin&retryWrites=true', {
    // useMongoClient: true
    useNewUrlParser: true
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`#########################################################`);
    console.log(`#  Request Time ${new Date().toString()} #`);
    console.log(`#########################################################`);
    res.header('Access-Control-Allow-Orgin', '*');
    res.header('Access-Control-Allow-Headers', 'Orgin, X-Request-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELETE, GET ');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;