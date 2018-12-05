const jwt = require('jsonwebtoken');
const isNotBlank = require("underscore.string/slugify");

function AuctionOrBuyUtility() {}

AuctionOrBuyUtility.USER_TOKEN = 'user-token';
AuctionOrBuyUtility.USER_REFRESH = 'user-refresh';
AuctionOrBuyUtility.DNS = 'http://currysin-server.ddns.net:8888/';
AuctionOrBuyUtility.PRODUCT_AUCTION = 'auction';
AuctionOrBuyUtility.PRODUCT_BUY = 'buy';
AuctionOrBuyUtility.PRODUCT_STATUS_ON_SELL = 'on_sell';
AuctionOrBuyUtility.PRODUCT_STATUS_SOLD = 'sold';
AuctionOrBuyUtility.PRODUCT_STATUS_SHIPPING = 'shipping';
AuctionOrBuyUtility.PRODUCT_STATUS_POD = 'pod';

AuctionOrBuyUtility.prototype.isTokenValid = function(jwtToken, secretType) {
    var secretKey = "";
    if (secretType === AuctionOrBuyUtility.USER_TOKEN) {
        secretKey = AuctionOrBuyUtility.USER_TOKEN;
    } else if (secretKey == AuctionOrBuyUtility.USER_REFRESH) {
        secretKey = AuctionOrBuyUtility.USER_REFRESH;
    }
    console.log(`[DEBUG] ${AuctionOrBuyUtility.USER_TOKEN}, ${this.USER_TOKEN}`);
    return new Promise((res, rej) => {
        jwt.verify(jwtToken, secretKey, function(err, decoded) {
            console.log(`[DEBUG] err: ${JSON.stringify(err)} decoded: ${JSON.stringify(decoded)} ${!decoded}`);
            if (err || !decoded) {
                console.log('error');
                rej(err);
            } else {
                const now = new Date().getTime();
                const exp = decoded.exp * 1000;
                console.log(`[DEBUG] now: ${now} exp: ${decoded.exp * 1000}`);
                if (exp > now) {
                    res(true);
                } else {
                    res(false);
                }
            }
        });
    });
};

AuctionOrBuyUtility.prototype.generateVerificationCode = function() {
    return Math.floor(100000 + Math.random() * 900000);
};

module.exports = AuctionOrBuyUtility;