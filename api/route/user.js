const express = require('express');
const monogoose = require('mongoose');
const isNotBlank = require("underscore.string/slugify");
const jwt = require('jsonwebtoken');
const AuctionOrBuyUtility = require('./../../utility/auctionOrBuyUtility');
const router = express.Router();

const User = require('./../../models/user');
const auctionOrBuyUtility = new AuctionOrBuyUtility();
// user sign up
router.post('/signup', (req, res, next) => {
    if (isNotBlank(req.body.username) && isNotBlank(req.body.password) && isNotBlank(req.body.first_name) &&
        isNotBlank(req.body.last_name) && isNotBlank(req.body.phone_number) && isNotBlank(req.body.dob)) {
        User.findOne({
            username: req.body.username
        }).exec().then((result => {
            if (isNotBlank(result)) {
                res.status(400).json({
                    message: 'user existing'
                });
            } else {
                const user = new User({
                    _id: new monogoose.Types.ObjectId(),
                    username: req.body.username,
                    password: req.body.password,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    phone_number: req.body.phone_number,
                    dob: req.body.dob,
                    balance: 0,
                    active: true
                });
                user.save().then(result => {
                    const token = jwt.sign({
                        _id: result._id,
                        username: result.username,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        phone_number: result.phone_number,
                        dob: result.dob,
                        balance: 0,
                        active: result.active
                    }, AuctionOrBuyUtility.USER_TOKEN, {
                        expiresIn: '2h'
                    });
                    const refreshToken = jwt.sign({
                        _id: result._id,
                        username: result.username,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        phone_number: result.phone_number,
                        dob: result.dob,
                        balance: 0,
                        active: result.active
                    }, AuctionOrBuyUtility.USER_REFRESH, {
                        expiresIn: '30d'
                    });
                    res.status(200).json({
                        accessToken: token,
                        refreshToken: refreshToken
                    });
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            }
        })).catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// user login
router.post('/login', (req, res, next) => {
    if (isNotBlank(req.body.username) && isNotBlank(req.body.password)) {
        User.findOne({
            username: req.body.username,
            password: req.body.password
        }).exec().then((result => {
            if (isNotBlank(result)) {
                const token = jwt.sign({
                    _id: result._id,
                    username: result.username,
                    first_name: result.first_name,
                    last_name: result.last_name,
                    phone_number: result.phone_number,
                    dob: result.dob,
                    balance: result.balance,
                    active: result.active
                }, AuctionOrBuyUtility.USER_TOKEN, {
                    expiresIn: '2h'
                });
                const refreshToken = jwt.sign({
                    _id: result._id,
                    username: result.username,
                    first_name: result.first_name,
                    last_name: result.last_name,
                    phone_number: result.phone_number,
                    dob: result.dob,
                    balance: result.balance,
                    active: result.active
                }, AuctionOrBuyUtility.USER_REFRESH, {
                    expiresIn: '30d'
                });
                res.status(200).json({
                    accessToken: token,
                    refreshToken: refreshToken
                });
            } else {
                res.status(404).json({
                    message: 'wrong username or password'
                });
            }
        })).catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// get user
router.get('/:username', (req, res, next) => {
    const username = req.params.username;
    const token = req.headers.token;
    // console.log(`[DEBUG] username: ${username} token: ${token}`);
    if (isNotBlank(username) && isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                User.findOne({
                    username: username
                }).exec().then((result => {
                    if (isNotBlank(result)) {
                        result.password = undefined;
                        res.status(200).json(result);
                    } else {
                        res.status(404).json({
                            message: 'No valid entry found for user ID'
                        });
                    }
                })).catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
            } else {
                res.status(500).json({
                    error: 'token not valid'
                });
            }
        }).catch((err) => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// user change password
router.post('/:username/change_password', (req, res, next) => {
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(username) && isNotBlank(token) &&
        isNotBlank(req.body.password) && isNotBlank(req.body.new_password)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                User.updateOne({ username: username }, {
                    $set: {
                        password: req.body.new_password
                    }
                }).exec().then(result => {
                    if (result.ok > 0) {
                        User.findOne({
                            username: username
                        }).exec().then(user => {
                            if (isNotBlank(user)) {
                                user.password = undefined;
                                res.status(200).json(user);
                            } else {
                                res.status(404).json({
                                    message: 'No valid entry found for user ID'
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        });
                    } else {
                        res.status(200).json({
                            updateTotal: result.n
                        });
                    }
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                })
            } else {
                res.status(500).json({
                    error: 'token not valid'
                });
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// update user information
router.post('/:username', (req, res, next) => {
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(username) && isNotBlank(token) && isNotBlank(req.body.first_name) &&
        isNotBlank(req.body.last_name) && isNotBlank(req.body.phone_number) && isNotBlank(req.body.dob)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                User.updateOne({ username: username }, {
                    $set: {
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        phone_number: req.body.phone_number,
                        dob: req.body.dob
                    }
                }).exec().then(result => {
                    if (result.ok > 0) {
                        User.findOne({
                            username: username
                        }).exec().then(user => {
                            if (isNotBlank(user)) {
                                user.password = undefined;
                                res.status(200).json(user);
                            } else {
                                res.status(404).json({
                                    message: 'No valid entry found for user ID'
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        });
                    } else {
                        res.status(200).json({
                            updateTotal: result.n
                        });
                    }
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            } else {
                res.status(500).json({
                    error: 'token not valid'
                });
            }
        }).catch((err) => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// update user balance
router.post('/:username/add_balance', (req, res, next) => {
    const username = req.params.username;
    const token = req.headers.token;
    const value = req.body.value;
    if (isNotBlank(username) && isNotBlank(token) && isNotBlank(value)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                User.updateOne({ username: username }, {
                    $set: {
                        balance: value
                    }
                }).exec().then(result => {
                    if (result.ok > 0) {
                        User.findOne({
                            username: username
                        }).exec().then(user => {
                            if (isNotBlank(user)) {
                                user.password = undefined;
                                res.status(200).json(user);
                            } else {
                                res.status(404).json({
                                    message: 'No valid entry found for user ID'
                                });
                            }
                        }).catch((err) => {
                            console.log(err);
                            res.status(500).json({ error: err });
                        });
                    } else {
                        res.status(200).json({
                            updateTotal: result.n
                        });
                    }
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            } else {
                res.status(500).json({
                    error: 'token not valid'
                });
            }
        }).catch((err) => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});

module.exports = router;