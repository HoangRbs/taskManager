const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail =(email,name) => {
    sgMail.send({
        to: email,
        from: 'hoangrbs@gmail.com',
        subject: 'Welcome mail',
        text: `Welcome ${name} to our app`
    });
}

module.exports = {
    sendWelcomeEmail
}
