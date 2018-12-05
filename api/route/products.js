const express = require('express');
const mongoose = require('mongoose');
const isNotBlank = require("underscore.string/slugify");
const AuctionOrBuyUtility = require('./../../utility/auctionOrBuyUtility');
const MongoService = require('../../services/mongo.service');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        console.log(`[DEBUG] file format: ${JSON.stringify(file)} : ${req.params.productId}`);
        cb(null, req.params.productId + '-' + new Date().toISOString() + '-' + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('file format only jpeg and png'), false);
    }
};
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Product = require('./../../models/product');
const Product_Shipping = require('./../../models/product_shipping');
const auctionOrBuyUtility = new AuctionOrBuyUtility();
const mongoService = new MongoService();

// create product
router.post('/create', (req, res, next) => {
    console.log('[DEBUG] create product');
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
                if (result) {
                    // product type - auction
                    if (req.body.type === AuctionOrBuyUtility.PRODUCT_AUCTION) {
                        if (isNotBlank(req.body.title) && isNotBlank(req.body.sub_title) && isNotBlank(req.body.sub_category) &&
                            isNotBlank(req.body.name) && isNotBlank(req.body.type) && isNotBlank(req.body.duration) &&
                            isNotBlank(req.body.price) && isNotBlank(req.body.target_bid) && isNotBlank(req.body.quantity) &&
                            isNotBlank(req.body.shipping_included) && isNotBlank(req.body.status) && isNotBlank(req.body.category) &&
                            isNotBlank(req.body.per_bid) && isNotBlank(req.body.start_time) && isNotBlank(req.body.end_time) &&
                            isNotBlank(req.body.seller)) {
                            const prodect = new Product({
                                _id: new mongoose.Types.ObjectId(),
                                title: req.body.title,
                                sub_title: req.body.sub_title,
                                image: [],
                                type: req.body.type,
                                category: req.body.category,
                                sub_category: req.body.sub_category,
                                duration: req.body.duration,
                                price: req.body.price,
                                target_bid: req.body.target_bid,
                                per_bid: req.body.per_bid,
                                quantity: req.body.quantity,
                                shipping_included: req.body.shipping_included,
                                shipping_info: req.body.shipping_info,
                                status: req.body.status,
                                active: true,
                                start_time: req.body.start_time,
                                end_time: req.body.end_time,
                                buyer: req.body.buyer,
                                seller: req.body.seller
                            });
                            prodect.save().then(result => {
                                res.status(200).json(result);
                            }).catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                        } else {
                            res.status(400).json({
                                message: 'input messing'
                            });
                        }
                    } else if (req.body.type === AuctionOrBuyUtility.PRODUCT_BUY) {
                        // product type - buy
                        if (isNotBlank(req.body.title) && isNotBlank(req.body.sub_title) && isNotBlank(req.body.sub_category) &&
                            isNotBlank(req.body.name) && isNotBlank(req.body.type) &&
                            isNotBlank(req.body.price) && isNotBlank(req.body.quantity) &&
                            isNotBlank(req.body.shipping_included) && isNotBlank(req.body.status) && isNotBlank(req.body.category) &&
                            isNotBlank(req.body.start_time) && isNotBlank(req.body.end_time) &&
                            isNotBlank(req.body.seller)) {
                            const prodect = new Product({
                                _id: new mongoose.Types.ObjectId(),
                                title: req.body.title,
                                sub_title: req.body.sub_title,
                                image: [],
                                type: req.body.type,
                                category: req.body.category,
                                sub_category: req.body.sub_category,
                                duration: null,
                                price: req.body.price,
                                target_bid: null,
                                per_bid: null,
                                quantity: req.body.quantity,
                                shipping_included: req.body.shipping_included,
                                shipping_info: null,
                                status: req.body.status,
                                active: true,
                                start_time: req.body.start_time,
                                end_time: req.body.end_time,
                                buyer: req.body.buyer,
                                seller: req.body.seller
                            });
                            prodect.save().then(result => {
                                res.status(200).json(result);
                            }).catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                        } else {
                            res.status(400).json({
                                message: 'input messing'
                            });
                        }
                    }
                } else {
                    res.status(400).json({
                        message: 'token not valid'
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(400).json({
            message: 'token messing'
        });
    }
});
// update product
router.post('/:productId', (req, res, next) => {
    console.log('[DEBUG] update product');
    const productId = req.params.productId;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
                if (result) {
                    if (req.body.type === AuctionOrBuyUtility.PRODUCT_AUCTION) {
                        if (isNotBlank(req.body.title) && isNotBlank(req.body.sub_title) && isNotBlank(req.body.sub_category) &&
                            isNotBlank(req.body.name) && isNotBlank(req.body.type) && isNotBlank(req.body.duration) &&
                            isNotBlank(req.body.price) && isNotBlank(req.body.target_bid) && isNotBlank(req.body.quantity) &&
                            isNotBlank(req.body.shipping_included) && isNotBlank(req.body.status) && isNotBlank(req.body.category) &&
                            isNotBlank(req.body.per_bid) && isNotBlank(req.body.start_time) && isNotBlank(req.body.end_time) &&
                            isNotBlank(req.body.seller)) {
                            mongoService.update(User, { _id: productId }, {
                                title: req.body.title,
                                sub_title: req.body.sub_title,
                                type: req.body.type,
                                category: req.body.category,
                                sub_category: req.body.sub_category,
                                duration: req.body.duration,
                                price: req.body.price,
                                target_bid: req.body.target_bid,
                                per_bid: req.body.per_bid,
                                quantity: req.body.quantity,
                                shipping_included: req.body.shipping_included,
                                shipping_info: req.body.shipping_info,
                                status: req.body.status,
                                active: true,
                                start_time: req.body.start_time,
                                end_time: req.body.end_time,
                                buyer: req.body.buyer,
                                seller: req.body.seller
                            }).then(update_result => {
                                if (update_result.ok > 0) {
                                    res.status(200).json({
                                        okTotal: update_result.ok
                                    });
                                } else {
                                    res.status(500).json({
                                        message: 'update not success'
                                    });
                                }
                            }).catch(err => {
                                res.status(400).json({
                                    error: err
                                });
                            })
                        } else if (req.body.type === AuctionOrBuyUtility.PRODUCT_BUY) {
                            if (isNotBlank(req.body.title) && isNotBlank(req.body.sub_title) && isNotBlank(req.body.sub_category) &&
                                isNotBlank(req.body.name) && isNotBlank(req.body.type) &&
                                isNotBlank(req.body.price) && isNotBlank(req.body.quantity) &&
                                isNotBlank(req.body.shipping_included) && isNotBlank(req.body.status) && isNotBlank(req.body.category) &&
                                isNotBlank(req.body.start_time) && isNotBlank(req.body.end_time) &&
                                isNotBlank(req.body.seller)) {
                                mongoService.update(Product, { _id: productId }, {
                                    title: req.body.title,
                                    sub_title: req.body.sub_title,
                                    type: req.body.type,
                                    category: req.body.category,
                                    sub_category: req.body.sub_category,
                                    duration: null,
                                    price: req.body.price,
                                    target_bid: null,
                                    per_bid: null,
                                    quantity: req.body.quantity,
                                    shipping_included: req.body.shipping_included,
                                    shipping_info: null,
                                    status: req.body.status,
                                    active: true,
                                    start_time: req.body.start_time,
                                    end_time: req.body.end_time,
                                    buyer: req.body.buyer,
                                    seller: req.body.seller
                                }).then(update_result => {
                                    if (update_result.ok > 0) {
                                        res.status(200).json({
                                            okTotal: update_result.ok
                                        });
                                    } else {
                                        res.status(500).json({
                                            message: 'update not success'
                                        });
                                    }
                                }).catch(err => {
                                    res.status(400).json({
                                        error: err
                                    });
                                });
                            } else {
                                res.status(400).json({
                                    message: 'input messing'
                                });
                            }
                        }
                    } else {
                        res.status(400).json({
                            message: 'token not valid'
                        });
                    }
                } else {
                    res.status(400).json({
                        message: 'token not valid'
                    });
                }
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(400).json({
            message: 'token messing'
        });
    }
});
// upload image
router.post('/:productId/upload_image', upload.single('productImage'), (req, res, next) => {
    console.log('[DEBUG] upload image');
    console.log('[DEBUG] image detail: ' + JSON.stringify(req.file));
    const productId = req.params.productId;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
                if (result) {
                    mongoService.query(Product, { _id: productId }).then(product => {
                        if (isNotBlank(product)) {
                            const productImages = product.image;
                            productImages.push(AuctionOrBuyUtility.DNS + req.file.path);
                            mongoService.update(Product, { _id: productId }, {
                                image: productImages
                            }).then(update_result => {
                                if (update_result.ok > 0) {
                                    res.status(200).json({
                                        okTotal: update_result.ok
                                    });
                                } else {
                                    res.status(500).json({
                                        message: 'update not success'
                                    });
                                }
                            }).catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                        } else {
                            res.status(400).json({
                                message: 'product not found'
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
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                });
            });
    } else {
        res.status(400).json({
            message: 'token messing'
        });
    }
});
// search by title
router.get('/search/title/:productTitle', (req, res, next) => {
    console.log('[DEBUG] search product by title');
    const productTitle = req.params.productTitle;
    if (isNotBlank(productTitle)) {
        mongoService.where(Product, 'title', new RegExp(productTitle)).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'product title messing'
        });
    }
});
// search by category
router.get('/search/category/:categoryName', (req, res, next) => {
    console.log('[DEBUG] search product by categoryName');
    const categoryName = req.params.categoryName;
    if (isNotBlank(categoryName)) {
        mongoService.where(Product, 'category', new RegExp(categoryName)).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'product category messing'
        });
    }
});
// search by sub category
router.get('/search/sub_category/:subCategoryName', (req, res, next) => {
    console.log('[DEBUG] search product by subCategoryName');
    const subCategoryName = req.params.subCategoryName;
    if (isNotBlank(subCategoryName)) {
        mongoService.where(Product, 'sub_category', new RegExp(subCategoryName)).then(result => {
            res.status(200).json(result);
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'product sub category messing'
        });
    }
});
// add product shipping record
router.post('/shipping/:productId', (req, res, next) => {
    console.log('[DEBUG] add product shipping record');
    const productId = req.params.productId;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                if (isNotBlank(req.body.title) && isNotBlank(req.body.sub_title) && isNotBlank(req.body.name) &&
                    isNotBlank(req.body.type) && isNotBlank(req.body.category) && isNotBlank(req.body.sub_category) &&
                    isNotBlank(req.body.price) && isNotBlank(req.body.quantity) && isNotBlank(req.body.seller) &&
                    isNotBlank(req.body.buyer) && isNotBlank(req.body.shipping_address) && isNotBlank(req.body.shipping_status) &&
                    isNotBlank(req.body.bought_time) && isNotBlank(productId)) {
                    const productShipping = new Product_Shipping({
                        _id: new mongoose.Types.ObjectId(),
                        product_id: productId,
                        title: req.body.title,
                        sub_title: req.body.sub_title,
                        name: req.body.name,
                        type: req.body.type,
                        category: req.body.category,
                        sub_category: req.body.sub_category,
                        price: req.body.price,
                        quantity: req.body.quantity,
                        seller: req.body.seller,
                        buyer: req.body.buyer,
                        shipping_address: req.body.shipping_address,
                        shipping_status: req.body.shipping_status,
                        bought_time: req.body.bought_time,
                        active: true
                    }).save().then(result => {
                        res.status(200).json(result);
                    }).catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
                } else {
                    res.status(400).json({
                        message: 'input messing'
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
            message: 'token messing'
        });
    }
});
// update product shippping status
router.post('/shipping/update/:shippingId/:shippingStatus', (req, res, next) => {
    console.log('[DEBUG] update product shipping status');
    const shippingId = req.params.shippingId;
    const shippingStatus = req.params.shippingStatus;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                mongoService.update(Product_Shipping, { _id: shippingId }, { shipping_status: shippingStatus }).then(update_result => {
                    if (update_result.ok > 0) {
                        mongoService.query(Product_Shipping, { _id: shippingId }).then(result => {
                            res.status(200).json(result);
                        }).catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                    } else {
                        res.status(500).json({
                            message: 'update not success'
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
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
    } else {
        res.status(400).json({
            message: 'token messing'
        });
    }
});
// get product shipping by product id and buyer or seller
router.post('/shipping/search_by_id/b_s/:productId/:buyer/:seller', (req, res, next) => {
    console.log('[DEBUG] get product shipping by product id and buyer or seller');
    const proudctId = req.params.productId;
    const buyer = req.params.buyer;
    const seller = req.params.seller;
    const token = req.headers.token;
    if (isNotBlank(token)) {
        auctionOrBuyUtility.isTokenValid(token, AuctionOrBuyUtility.USER_TOKEN).then(result => {
            if (result) {
                Product_Shipping
                    .where('product_id', new RegExp(proudctId))
                    .where('buyer', new RegExp(buyer))
                    .where('seller', new RegExp(seller)).exec().then(result => {
                        res.status(200).json(result);
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
            message: 'token messing'
        });
    }
});

module.exports = router;