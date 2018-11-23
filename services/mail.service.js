const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

function MailService() {}

MailService.prototype.sendMail = function(from, to, subject, text) {
    const transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        auth: {
            user: 'auction.buy.ou@gmail.com', // generated ethereal user
            pass: 'auction.buy.ou2018' // generated ethereal password
        }
    }));

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text
    };

    return new Promise((res, rej) => {
        transporter.sendMail(mailOptions, (error, info) => {
            console.log(`[DEBUG] error: ${JSON.stringify(error)}`);
            console.log(`[DEBUG] info: ${JSON.stringify(info)}`);
            if (error) {
                rej(error);
            } else {
                res(info);
            }
        });
    })
};

MailService.prototype.sendVerificationMail = function(to, verificationCode) {
    return new Promise((res, rej) => {
        this.sendMail('"<Auction Or Buy>" auction.buy.ou@gmail.com',
            to,
            'Verification Account',
            'Hello, your verification code: ' + verificationCode).then(result => {
            res(result);
        }).catch(err => {
            rej(err);
        });
    })
};

module.exports = MailService;