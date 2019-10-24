const sgMail = require('@sendgrid/mail');

const sendWelcomeEmail = (email,name) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
