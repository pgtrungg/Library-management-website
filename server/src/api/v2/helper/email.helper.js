const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text, html) => {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: "Library Management System",
        to: email,
        subject: subject,
        text: text,
        html: html,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info);
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

module.exports = sendEmail;