import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sequelize from '../config/sequelize.js';
import { User } from '../models/index.js';
import sendOTP from './otp.js';
import cookieParser from 'cookie-parser';

// start with the login/sign up

const debug = true;

// hash password 
async function hashPassword(password) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
}

// validate email
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    return re.test(email);
}   

// check if email in database, default behaviour: false
async function emailExists(input_email) {
    const user_email = await User.findOne({
        where: {
            email : input_email
        }
    })
    if (debug) {
        console.log("This is user email: ", user_email);
    }
    // if it exists return false
    if (user_email) return true;
    return false;
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return re.test(password)
}

// add to database
async function addUser(username, password, email) {
    // Hash password
    const hashedPassword = hashPassword(password);

    await User.create({
        username: username,
        password: hashedPassword,
        email: email,
        role_code: "USR",
        last_login: new Date(Date.now())
    })
}

async function getCreds(username, password) {
    const hashedPassword = hashPassword(password);
    const user = await User.findOne({
        where: {
            username: username,
            password: hashedPassword
        }
    })

    if (!user) return false

    return true
};

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '360s'});
};

function createRefreshToken(payload) {
    
    return jwt.sign({email: payload}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'});
};

function createOTPToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
}

export const signUp = async (req, res) => {
    // get request body
    const {username, password, email} = req.body;

    try {
        // check for emptiness
        if (!username || !password || !email) {
            return res.status(400).json({
                message: "All fields must be filled"
            });
        };
        // check for username validity
        if (username.length < 3) {
            return res.status(400).json({
                message: "Username length must be 3 or longer"
            })
        };
        
        // check for email validity
        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid email" });

        if (await emailExists(email)) return res.status(400).json({message: "Email is in use"});

        // check for password validity
        if (!validatePassword(password)) return res.status(400).json({message: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"});

        // send email here, not yet stored the refresh token
        const hashedPassword = await hashPassword(password);
        const newUser = {
            username: username,
            password: hashedPassword,
            email: email
        }
        // create otp token with user info
        const otpToken = createOTPToken(newUser);
        const actLink = `${process.env.BASE_URL}/api/user/${newUser}/activate/${otpToken}`;
        await sendOTP(email, "OTP Sign Up Verification", actLink);

        res.status(200).json({
            message: `Successfully sent otp. Please check your email at ${email}`,
            username: username,
            email: email
        });
    } catch (error) {
        console.log(error)
    }
};

export const activate = async (req, res) => {
    // get token from e
    const token = req.params.token;
    const user = req.params.user

}

export const logIn = async (req, res) => {
    const {username, password} = req.body
    try {

    } catch (error) {

    }
}
