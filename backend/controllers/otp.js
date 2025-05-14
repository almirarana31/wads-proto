import sendEmail from "../utils/sendEmail.js";

const sendOTP = async ( email, message, actLink, duration = 1) => {
    try {
        // send email
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Bianca Help Desk Mail Support",
            html: `<h1>${message}</h1> <a style="color:tomato;
            font-size:25px;letter-spacing:2px;" href="${actLink}">Click this link to activate your email!</a> This link <b>expires in ${duration} hour(s)</b>`
        };
        await sendEmail(mailOptions);

    } catch (error) {
        throw error;
    }
};

export default sendOTP;
