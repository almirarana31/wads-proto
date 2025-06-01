import sendEmail from "../utils/sendEmail.js";

const sendOTP = async ( email, message, text, duration = 2) => {
    try {
        // send email
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: message,
            text: text
        };
        await sendEmail(mailOptions);

    } catch (error) {
        throw error;
    }
};

export default sendOTP;
