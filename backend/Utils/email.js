const { emailUser, emailPassword } = require('../config/config.js');
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: emailUser,
        pass: emailPassword
    },
    tls: {
        ciphers: 'SSLv3'
    }

});

// Function to send email
exports.sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: emailUser,
            to,
            subject,
            html
        };

        // Send email and wait for the response
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Throw the error to handle it in the controller
    }
};

