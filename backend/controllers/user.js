import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Staff, User, Ticket} from '../models/index.js';
import sendOTP from './otp.js';
import { logAudit } from './audit.js';

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
    // get from user table
    const user = await User.findOne({
        where: {
            email: input_email
        }
    });

    // if it exists return true
    if (user) return true 

    return false;
}

// validate password
function validatePassword(password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/
    return re.test(password)
}

// check role in database
async function checkRole(user_email) {

    const user = await Staff.findOne({
        where: {
            email: user_email
        },
        raw: true
    });

    if (user) {
        const staff_id = user.id
        return staff_id
    };

    return false;
}

async function getCreds(user_email, password) {

    const user = await User.findOne({
        where: {
            email: user_email
        }
    })

    if (!user) {
        return false
    }

    // check password validity
    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
        return false
    }

    return user.id
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
        const staff_id = await checkRole(email);
        const hashedPassword = await hashPassword(password);
        const newUser = {
            username: username,
            password: hashedPassword,
            email: email,
            staff_id: staff_id ? staff_id : false
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
        const {username, password, email, staff_id} = decode;

        if(await emailExists(email)) {
            return res.status(400).json({message: "email already exists"})
        }
        // add to database

        const user = await User.create({
            username: username,
            password: password,
            email: email,
            staff_id: staff_id ? staff_id : null,
            is_guest: false
        });

        // audit here 
        await logAudit(
            "Create", 
            user.id, 
            `${staff_id ? "Staff" : "User"} account created (email: ${email}, username: ${username}, id: ${user.id}${staff_id ? `, ${staff_id}` : ""})`
        )
        console.log(`${staff_id ? "Staff" : "User"} account created (email: ${email}, username: ${username}, id: ${user.id}${staff_id ? `, ${staff_id}` : ""})`);
        
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
                attributes: ['id', 'staff_id', 'email', 'username', 'is_guest'],
                raw: true
            });

            console.log(`Pre-Staff_id: ${user.staff_id}`)

            if (!user.staff_id) {
                user.staff_id = 0
            }

            console.log(`Post-Staff_id: ${user.staff_id}`)
            
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
};

export const forgetPassword = async (req, res) => {
    const {email, password} = req.body

    try {
        // check for email validity
        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid email" });

        const user = await User.findOne({
            where: {
                email: email
            },
            raw: true,
            attributes: ['id']
        });

        const user_id = user.id;

        // if (!user) {
        //     return res.status(400).json({message: "Not a user"})
        // }
        
        const hashedPassword = await hashPassword(password);

        // create otp token with user info
        const otpToken = createOTPToken({email: email, id: user_id, password: hashedPassword});
        const actLink = `${process.env.BASE_URL}/api/user/confirm-password-reset/${otpToken}`;
        await sendOTP(email, "Reset Password Link", actLink);

        return res.status(200).json({message: "Successfully sent password reset link"});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const confirmPassReset = async (req, res) => {
    // get token from e
    const token = req.params.token;
    try {
       // verify access token
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const {id, password} = decode;

        await User.update({
            password: password
        }, {
            where: {
                id: id
            }
        });

        return res.status(200).json({message: "Password has been reset"});
    } catch (error) {
        return res.status(400).json({message: "Invalid reset password link"});
    }
};

export const validResetLink = async (req, res) => {
    // get token from e
    const token = req.params.token;
    try {
       // verify access token
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        return res.status(200).json({message: "Valid reset password link"});
    } catch (error) {
        return res.status(400).json({message: "Invalid reset password link"});
    }
};

// tickets
export const submitTicket = async (req, res) => {
    const user_email = req.query.email

    
    const {email, title, category_id, description} = req.body;

    try {
        

    } catch (error) {

    }
};

// gets user ticket details
export const getUserTickets = async (req, res) => {
    try {
        const userId = req.user.id; // req.user is set by userAuthZ middleware

        const tickets = await Ticket.findAll({
            where: { user_id: userId },
            attributes: ['id', 'subject', 'description', 'category_id', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ tickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
