const jwt = require('jsonwebtoken');
const isNotBlank = require("underscore.string/slugify");

function AuctionOrBuyUtility() {}

AuctionOrBuyUtility.USER_TOKEN = 'user-token';
AuctionOrBuyUtility.USER_REFRESH = 'user-refresh';

AuctionOrBuyUtility.prototype.isTokenValid = function(jwtToken, secretType) {
    var secretKey = "";
    if (secretType === AuctionOrBuyUtility.USER_TOKEN) {
        secretKey = AuctionOrBuyUtility.USER_TOKEN;
    } else if (secretKey == AuctionOrBuyUtility.USER_REFRESH) {
        secretKey = AuctionOrBuyUtility.USER_REFRESH;
    }
    console.log(`[DEBUG] ${AuctionOrBuyUtility.USER_TOKEN}, ${this.USER_TOKEN}`);
    return new Promise((resolve, reject) => {
        jwt.verify(jwtToken, secretKey, function(err, decoded) {
            const now = new Date().getTime();
            if (err || !decoded) {
                reject(err);
            } else {
                console.log(`[DEBUG] now: ${now} exp: ${decoded.exp}`);
                const exp = decoded.exp * 1000;
                if (exp > now) {
                    resolve(true);
                } else {
                    reject(false);
                }
            }
        });
    });
};

AuctionOrBuyUtility.prototype.generateVerificationCode = function() {
    return Math.floor(100000 + Math.random() * 900000);
};

module.exports = AuctionOrBuyUtility;