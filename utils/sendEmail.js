import path from 'path'
import ejs from 'ejs'
import nodemailer from 'nodemailer'

const sendEmail = async (user, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER, // Gmail address
                pass: process.env.EMAIL_PASS, // App password (no spaces)
            },
        });

        // const templatePath = path.join(__dirname, "..", "views", "TwoFa", "twofa.ejs");
        // const htmlContent = await ejs.renderFile(templatePath, { uuid });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (err) {
        console.error("Error sending email:", err);
    }
};

export default sendEmail;