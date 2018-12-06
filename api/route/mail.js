const express = require('express');
const mongoose = require('mongoose');
const isNotBlank = require("underscore.string/slugify");
const jwt = require('jsonwebtoken');
const AuctionOrBuyUtility = require('./../../utility/auctionOrBuyUtility');
const MailService = require('../../services/mail.service');
const MongoService = require('../../services/mongo.service');
const router = express.Router();

const Mail = require('./../../models/mail');
const auctionOrBuyUtility = new AuctionOrBuyUtility();
const mailService = new MailService();
const mongoService = new MongoService();

// recive mail
router.post('/receive/:username', (req, res, next) => {
    console.log('[DEBUG] check out email');
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                mongoService.queryAll(Mail, { receiver: username }).then(result => {
                    res.status(200).json(result);
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            } else {
                res.status(400).json({
                    message: 'token not valid'
                });
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'token missing'
        });
    }
});

// send a mail
router.post('/send/:username', (req, res, next) => {
    console.log('[DEBUG] check out email');
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                if (isNotBlank(username) && isNotBlank(req.body.receiver) && isNotBlank(req.body.subject) &&
                    isNotBlank(req.body.date) && isNotBlank(req.body.content)) {
                    const mail = new Mail({
                        _id: new mongoose.Types.ObjectId(),
                        sender: username,
                        receiver: req.body.receiver,
                        date: req.body.date,
                        subject: req.body.subject,
                        content: req.body.content,
                        enroll: [],
                        status: 'send',
                        active: true
                    });

                    mail.save().then(result => {
                        res.status(200).json(result);
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
            } else {
                res.status(400).json({
                    message: 'token not valid'
                });
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'token missing'
        });
    }
});

// reply a mail
router.post('/reply/:username', (req, res, next) => {
    console.log('[DEBUG] check out email');
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                if (isNotBlank(username) && isNotBlank(req.body.receiver) && isNotBlank(req.body.subject) &&
                    isNotBlank(req.body.date) && isNotBlank(req.body.content)) {
                    const mail = new Mail({
                        _id: new mongoose.Types.ObjectId(),
                        sender: username,
                        receiver: req.body.receiver,
                        date: req.body.date,
                        subject: req.subject,
                        content: req.body.content,
                        enroll: req.body.enroll,
                        status: 'reply',
                        active: true
                    });

                    mail.save().then(result => {
                        res.status(200).json(result);
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
            } else {
                res.status(400).json({
                    message: 'token not valid'
                });
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'token missing'
        });
    }
});

// get mail by mail id
router.post('/:mailId', (req, res, next) => {
    console.log('[DEBUG] check out email');
    const mailId = req.params.mailId;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                if (isNotBlank(mailId)) {
                    mongoService.query(Mail, { _id: mailId }).then(result => {
                        res.status(200).json(result);
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
            } else {
                res.status(400).json({
                    message: 'token not valid'
                });
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'token missing'
        });
    }
});

module.exports = router;