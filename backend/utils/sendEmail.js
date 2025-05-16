import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
});

// test transporter
transporter.verify((err, scc) => {
    if(err) {
        console.log(err);
    } else {
        console.log("Ready for messages");
        console.log(scc);
    }
});

const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        return;
    } catch (err) {
        throw err;
    };
}

export default sendEmail;