const monogoose = require('mongoose');

function MongoService() {}

MongoService.prototype.query = function(schema, param) {
    return new Promise((res, rej) => {
        schema.findOne(param).exec().then(result => {
            res(result);
        }).catch(err => {
            rej(err)
        })
    });
};

MongoService.prototype.queryAll = function() {

};

MongoService.prototype.insert = function() {

};

MongoService.prototype.update = function(schema, param, data) {
    return new Promise((res, rej) => {
        schema.updateOne(param, { $set: data }).exec().then(result => {
            res(result);
        }).catch(err => {
            rej(err)
        })
    });
};

MongoService.prototype.delete = function() {

};
module.exports = MongoService;