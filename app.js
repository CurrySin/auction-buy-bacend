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
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`#########################################################`);
    console.log(`#  Request Time ${new Date().toString()} #`);
    console.log(`#########################################################`);
    console.log(`req.baseUrl: ${JSON.stringify(req.baseUrl)}`);
    console.log(`req.body: ${JSON.stringify(req.body)}`);
    console.log(`req.hostname: ${JSON.stringify(req.hostname)}`);
    console.log(`req.ip: ${JSON.stringify(req.ip)}`);
    console.log(`req.ips: ${JSON.stringify(req.ips)}`);
    console.log(`req.originalUrl: ${JSON.stringify(req.originalUrl)}`);
    console.log(`req.path: ${JSON.stringify(req.path)}`);
    console.log(`req.protocol: ${JSON.stringify(req.protocol)}`);
    console.log(`req.query: ${JSON.stringify(req.query)}`);
    console.log(`#########################################################`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Orgin, X-Request-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELETE, GET');
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