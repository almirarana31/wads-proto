import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Staff, User } from '../models/index.js';
import sendOTP from './otp.js';
import sessionStorage from 'sessionstorage';

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

// check role in database
async function checkRole(user_email) {
    const dbEmail = await Staff.findOne({
        where: {
            email: user_email
        }
    });

    if (dbEmail) {
        const role = dbEmail.role_code;
        return role
    }

    return "USR";
}

async function getCreds(user_email, password) {
    
    const user = await User.findOne({
        where: {
            email: user_email
        }
    })
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(user_email, isMatch);

    if (isMatch) return true

    return false
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
        const role_code = await checkRole(email);
        const hashedPassword = await hashPassword(password);
        const newUser = {
            username: username,
            password: hashedPassword,
            email: email,
            role_code: role_code
        };
        // create otp token with user info
        const otpToken = createOTPToken(newUser);
        const actLink = `${process.env.BASE_URL}/api/user/activate/${otpToken}`;
        await sendOTP(email, "OTP Sign Up Verification", actLink);

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
        const {username, password, email, role_code} = decode;

        if(await emailExists(email)) {
            return res.status(400).json({message: "email already exists"})
        }
        
        // add to database
        await User.create({
            username: username,
            password: password,
            email: email,
            role_code: role_code
        });
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
                    email: email
                },
                attributes: ['email', 'id', 'role_code'],
                raw: true
            });

            const accessToken = createAccessToken(user);
            sessionStorage.setItem("token", accessToken);
            

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
            return res.status(200).json({message:"Successful login", token: accessToken});
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
