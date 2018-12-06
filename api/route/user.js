const express = require('express');
const monogoose = require('mongoose');
const isNotBlank = require("underscore.string/slugify");
const jwt = require('jsonwebtoken');
const AuctionOrBuyUtility = require('./../../utility/auctionOrBuyUtility');
const MailService = require('../../services/mail.service');
const MongoService = require('../../services/mongo.service');
const router = express.Router();

const User = require('./../../models/user');
const auctionOrBuyUtility = new AuctionOrBuyUtility();
const mailService = new MailService();
const mongoService = new MongoService();

// user sign up
router.post('/signup', (req, res, next) => {
    console.log('[DEBUG] user signup');
    if (isNotBlank(req.body.username) && isNotBlank(req.body.password) && isNotBlank(req.body.first_name) &&
        isNotBlank(req.body.last_name) && isNotBlank(req.body.phone_number) && isNotBlank(req.body.dob) &&
        isNotBlank(req.body.email)) {
        const verificationCode = auctionOrBuyUtility.generateVerificationCode();
        mongoService.query(User, { username: req.body.username }).then((result => {
            if (isNotBlank(result)) {
                res.status(400).json({
                    message: 'user exist'
                });
            } else {
                const user = new User({
                    _id: new monogoose.Types.ObjectId(),
                    username: req.body.username,
                    password: req.body.password,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    phone_number: req.body.phone_number,
                    email: req.body.email,
                    dob: req.body.dob,
                    balance: 0,
                    active: false,
                    verification_code: verificationCode
                });
                user.save().then(result => {
                    mailService.sendVerificationMail(req.body.email, verificationCode).then(result => {
                        res.status(200).json({
                            username: req.body.username,
                            verifyFrom: 'email',
                            verification_code: verificationCode
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }).catch(err => {
                    res.status(500).json({
                        error: err
                    });
                });
            }
        })).catch((err) => {
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
    console.log('[DEBUG] user login');
    if (isNotBlank(req.body.username) && isNotBlank(req.body.password)) {
        mongoService.query(User, {
            username: req.body.username,
            password: req.body.password
        }).then((result => {
            if (isNotBlank(result)) {
                if (result.active === true) {
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
                } else {
                    res.status(400).json({ error: 'user in inactive status' });
                }
            } else {
                res.status(400).json({
                    message: 'user not found'
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
    console.log('[DEBUG] get user balance');
    const username = req.params.username;
    const token = req.headers.token;
    // console.log(`[DEBUG] username: ${username} token: ${token}`);
    if (isNotBlank(username) && isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                mongoService.query(User, { username: username }).then((result => {
                    if (isNotBlank(result)) {
                        result.password = undefined;
                        result.verification_code = undefined;
                        res.status(200).json(result);
                    } else {
                        res.status(404).json({
                            message: 'No valid entry found for username'
                        });
                    }
                })).catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
            } else {
                res.status(400).json({
                    message: 'token not valid'
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
// update user information
router.post('/:username', (req, res, next) => {
    console.log('[DEBUG] update user information');
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(username) && isNotBlank(token) && isNotBlank(req.body.first_name) &&
        isNotBlank(req.body.last_name) && isNotBlank(req.body.phone_number) && isNotBlank(req.body.dob) &&
        isNotBlank(req.body.active)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                mongoService.update(User, { username: username }, {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    phone_number: req.body.phone_number,
                    dob: req.body.dob
                }).then(result => {
                    if (result.ok > 0) {
                        mongoService.query(User, { username: username }).then(user => {
                            if (isNotBlank(user)) {
                                user.password = undefined;
                                user.verification_code = undefined;
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
                res.status(400).json({
                    message: 'token not valid'
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
    console.log('[DEBUG] user change password');
    const username = req.params.username;
    const token = req.headers.token;
    if (isNotBlank(username) && isNotBlank(token) &&
        isNotBlank(req.body.password) && isNotBlank(req.body.new_password)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                mongoService.update(User, { username: username }, { password: req.body.new_password }).then(result => {
                    if (result.ok > 0) {
                        mongoService.query(User, { username: username }).then(user => {
                            if (isNotBlank(user)) {
                                user.password = undefined;
                                user.verification_code = undefined;
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
            message: 'input missing'
        });
    }
});
// update user balance
router.post('/:username/add_balance', (req, res, next) => {
    console.log('[DEBUG] add user balance');
    const username = req.params.username;
    const token = req.headers.token;
    const value = req.body.value;
    if (isNotBlank(username) && isNotBlank(token) && isNotBlank(value)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then((result) => {
            if (result == true) {
                mongoService.update(User, { username: username }, { balance: value }).then(result => {
                    if (result.ok > 0) {
                        mongoService.query(User, { username: username }).then(user => {
                            if (isNotBlank(user)) {
                                user.password = undefined;
                                user.verification_code = undefined;
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
                res.status(400).json({
                    message: 'token not valid'
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
// user forgot password
router.post('/:username/forgot_password', (req, res, next) => {
    console.log('[DEBUG] user forgot password');
    const username = req.params.username;
    if (isNotBlank(username)) {
        mongoService.query(User, { username: username }).then(user => {
            const email = user.email;
            const verificationCode = auctionOrBuyUtility.generateVerificationCode();
            mongoService.update(User, { username: username }, { active: false, verification_code: verificationCode }).then(result => {
                if (result.ok > 0) {
                    mailService.sendVerificationMail(email, verificationCode).then(result => {
                        res.status(200).json({
                            username: req.body.username,
                            verifyFrom: 'email',
                            verification_code: verificationCode
                        });
                    }).catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                } else {
                    res.status(200).json({
                        updateTotal: result.n
                    });
                }
            }).catch(err => {
                res.status(500).json({
                    message: err
                });
            });
        }).catch(err => {
            res.status(400).json({
                message: err
            });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// user renew password
router.post('/:username/forgot_password/renew', (req, res, next) => {
    console.log('[DEBUG] reset user passsword');
    const username = req.params.username;
    const verificationCode = req.body.verificationCode;
    if (isNotBlank(username) && isNotBlank(verificationCode) && isNotBlank(req.body.newPassword)) {
        mongoService.query(User, { username: username }).then(user => {
            console.log('[DEBUG] user verification code: ' + user.verification_code);
            if (user.verification_code === verificationCode) {
                mongoService.update(User, { username: username }, { active: true, verificationCode: '', password: req.body.newPassword }).then(result => {
                    console.log(result);
                    res.status(200).json({
                        updateTotal: result.n
                    });
                }).catch(err => {
                    res.status(500).json({
                        message: err
                    });
                });
            } else {
                res.status(400).json({
                    message: 'verification code was wrong'
                });
            }
        }).catch(err => {
            res.status(400).json({
                message: err
            });
        });
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// verify user
router.post('/:username/verify', (req, res, next) => {
    console.log('[DEBUG] verify user');
    const username = req.params.username;
    const verificationCode = req.body.verification_code;
    if (isNotBlank(username) && isNotBlank(verificationCode)) {
        mongoService.query(User, { username: username }).then(user => {
            if (user.active === true) {
                res.status(400).json({
                    message: 'user in active status'
                });
            } else {
                if (user.verification_code === verificationCode) {
                    mongoService.update(User, { username: username }, {
                        verification_code: '',
                        active: true
                    }).then(result => {
                        if (result.ok > 0) {
                            mongoService.query(User, { username: username }).then(user => {
                                if (isNotBlank(user)) {
                                    user.password = undefined;
                                    user.verification_code = undefined;
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
                    res.status(400).json({
                        message: 'invalid verification code'
                    });
                }
            }
        }).catch(err => {
            res.status(400).json({
                message: err
            });
        })
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// resend verification code
router.post('/:username/verify/renew', (req, res, next) => {
    console.log('[DEBUG] resend verification code');
    const username = req.params.username;
    const email = req.body.email;
    if (isNotBlank(username)) {
        mongoService.query(User, { username: username }).then(user => {
            if (user.active === true) {
                res.status(400).json({
                    message: 'user in active status'
                });
            } else {
                const verificationCode = auctionOrBuyUtility.generateVerificationCode(email);
                mongoService.update(User, { username: username }, { verification_code: verificationCode }).then(result => {
                    if (result.ok > 0) {
                        mailService.sendVerificationMail(email, verificationCode).then(result => {
                            res.status(200).json({
                                username: req.body.username,
                                verifyFrom: 'email',
                                verification_code: verificationCode.toString()
                            });
                        }).catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                    } else {
                        res.status(200).json({
                            updateTotal: result.n
                        });
                    }
                }).catch(err => {
                    res.status(400).json({
                        message: err
                    });
                });
            }
        }).catch(err => {
            res.status(400).json({
                message: err
            });
        })
    } else {
        res.status(400).json({
            message: 'input missing'
        });
    }
});
// refresh token
router.post('/refresh/:username', (req, res, next) => {
    console.log('[DEBUG] refresh token');
    const username = req.params.username;
    const refreshToken = req.headers.token;
    console.log(`[DEUBG] ${username} ${refreshToken}`);
    if (isNotBlank(refreshToken) && isNotBlank(username)) {
        auctionOrBuyUtility.isTokenValid(refreshToken, AuctionOrBuyUtility.USER_REFRESH).then((tokenResult) => {
            if (tokenResult) {
                mongoService.query(User, {
                    username: username
                }).then((result => {
                    if (isNotBlank(result)) {
                        if (result.active === true) {
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
                                const newRefreshToken = jwt.sign({
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
                                    refreshToken: newRefreshToken
                                });
                            } else {
                                res.status(404).json({
                                    message: 'wrong username or password'
                                });
                            }
                        } else {
                            res.status(400).json({ error: 'user in inactive status' });
                        }
                    } else {
                        res.status(400).json({
                            message: 'user not found'
                        });
                    }
                })).catch((err) => {
                    console.log(err);
                    res.status(500).json({ error: err });
                });
            } else {
                res.status(400).json({
                    message: 'refresh token not valid'
                });
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        })
    } else {
        res.status(400).json({
            message: 'refresh token missing'
        });
    }
});
module.exports = router;