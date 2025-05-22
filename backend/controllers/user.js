import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Staff, User, Customer, StaffDetail } from '../models/index.js';
import sendOTP from './otp.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';

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

    const cust_email = await Customer.findOne({
        where: {
            email: input_email
        }
    })

    const staff_email = await Staff.findOne({
        include: [{
            model: StaffDetail,
            required: true
        }],
        where: {
            '$StaffDetail.email$': input_email
        }
    })

    // if it exists return false
    if (cust_email || staff_email) return true;
    return false;
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return re.test(password)
}

// check role in database
async function checkDetail(user_email) {
    const staffDetail = await StaffDetail.findOne({
        where: {
            email: user_email
        }
    });

    if (staffDetail) {
        const detail_id = staffDetail.id;
        return detail_id
    }

    return false;
}

async function getCreds(user_email, password) {

    const user = await User.findOne({
        include: [{
            model: Customer,
            where: {
                email: user_email
            },
            required: true
        }, {
            model: Staff,
            include: {
                model: StaffDetail,
                required: true
            },
            where: {
                '$StaffDetail.email$': user_email
            },
            required: true
        }],
        raw: true
    })

    if (user) {
        if (user['Customer.email']) {
            const isMatch = await bcrypt.compare(password, user['Customer.password'])
            return user.id
        }
        else if (user['Staff.StaffDetail.email']) {
            const isMatch = await bcrypt.compare(password, user['Staff.password'])
            return user.id
        } 
    }

    return false
};

function createRememberMeToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'});
};

function createAccessToken(payload) { // is a refresh token that expires quicker
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
};

function createOTPToken(payload) { // is a refresh token that expires quicker
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '120s'})
};

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
        const detail_id = await checkDetail(email);
        const hashedPassword = await hashPassword(password);
        const newUser = {
            username: username,
            password: hashedPassword,
            email: email,
            ...(detail_id && {detail_id: detail_id})
        };
        // create otp token with user info
        const otpToken = createOTPToken(newUser);
        const actLink = `${process.env.BASE_URL}/api/user/activate/${otpToken}`;
        await sendOTP(email, "OTP Sign Up Verification", actLink);

        // only for development
        console.log(otpToken);

        console.log("hello world");

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

    try {
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {username, password, email, detail_id} = decode;

        if(await emailExists(email)) {
            return res.status(400).json({message: "email already exists"})
        }
        // add to database
        if(detail_id) {
            const staff = await Staff.create({
                username: username,
                password: password,
                detail_id: detail_id
            })

            await User.create({
                staff_id: staff.id
            });
        } else {
            const customer = await Customer.create({
                username: username,
                password: password,
                email: email
            });
            await User.create({
                customer_id: customer.id
            });
        }
        
        return res.status(200).json({message: 'Successfully signed up!',
            username: username,
            email: email
        });
    } catch (error) {
        return res.status(400).json({message: error.message});
    } 
}

export const logIn = async (req, res) => {
    const {email, password, rememberMe} = req.body
    try {
        const login = await getCreds(email, password);

        if (login) {
            // storing the access token in session storage
            const user = await User.findOne({
                where: {
                    id: login
                },
                raw: true
            });
            
            // for session storage
            const accessToken = createAccessToken(user);
            let rememberMeToken =  " ";

           // if remember me, create a rememberMe token
            if (rememberMe) {
                rememberMeToken = createRememberMeToken(user);
            } else {
                rememberMeToken = null;
            }
            

            // update login time
            await User.update({
                last_login: new Date(Date.now())
            },
                {   
                    where: {
                        email: email
                    }
                }
            );
            
            return res.status(200).json({message:"Successful login", 
                sessionToken: accessToken, localToken: rememberMeToken
        });
        };
        return res.status(400).json({message: "Incorrect credentials"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    };
};

export const signOut = async (req, res) => {
    try {
        return res.status(200).json({message:"Successfully signed out",
            clearLocalStorage: true
        });
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}
