const { transporter } = require('./emailTransporter');

function sendMail(name, email, token) {

    let mailOptions = {
        from: '"ReviewZone" <donot-reply@reviewZone.com>',
        to: `${email}`,
        subject: 'Forgot Password',
        text: `Hello ${name},\nReset your password by clicking the following url\n`+
                `http://localhost:3000/api/auth/resetPassword/${token}\n\nThanks,\nReviewZone`,
        html: `<p>Hello ${name},<br/><br/>Reset your password by clicking the following url<br/>
                <a href="http://localhost:3000/api/auth/resetPassword/${token}">
                http://localhost:3000/api/auth/resetPassword/${token}</a> 
                <br/><br/>Thanks,<br/>ReviewZone</p>`
    };

    return transporter.sendMail(mailOptions);
}

module.exports.sendMail = sendMail;