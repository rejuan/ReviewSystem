const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'zehmmqctsylqa7dh@ethereal.email',
        pass: 'w1JPVttrWQbdnysepk'
    }
});

module.exports.transporter = transporter;