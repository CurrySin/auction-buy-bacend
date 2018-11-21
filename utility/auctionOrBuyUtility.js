const jwt = require('jsonwebtoken');
const isNotBlank = require("underscore.string/slugify");

function AuctionOrBuyUtility() {}

AuctionOrBuyUtility.USER_TOKEN = 'user-token';
AuctionOrBuyUtility.USER_REFRESH = 'user-refresh';

AuctionOrBuyUtility.prototype.isTokenValid = function(jwtToken, secretType) {
    console.log(`[DEBUG] ${AuctionOrBuyUtility.USER_TOKEN}, ${this.USER_TOKEN}`);
    var secretKey = "";
    if (secretType === AuctionOrBuyUtility.USER_TOKEN) {
        secretKey = AuctionOrBuyUtility.USER_TOKEN;
    } else if (secretKey == AuctionOrBuyUtility.USER_REFRESH) {
        secretKey = AuctionOrBuyUtility.USER_REFRESH;
    }
    return new Promise((resolve, reject) => {
        jwt.verify(jwtToken, secretKey, function(err, decoded) {
            const now = new Date().getTime();
            console.log(`[DEBUG] now: ${now} exp: ${decoded.exp}`);
            if (err) {
                reject(err);
            } else {
                const exp = decoded.exp * 1000;
                if (exp > now) {
                    resolve(true);
                } else {
                    reject(false);
                }
            }
        });
    });
}

module.exports = AuctionOrBuyUtility;