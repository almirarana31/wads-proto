import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Staff, User, Ticket, Category, Status} from '../models/index.js';
import sendOTP from './otp.js';
import { logAudit } from './audit.js';
import sequelize from '../config/sequelize.js';
import {Op} from 'sequelize';

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
        const actLink = `${process.env.FRONTEND_URL}/activate/${otpToken}`;
        // Improved HTML email body
        const emailBody = `
          <div style="font-family: Arial, sans-serif; background: #f4f8fb; padding: 32px;">
            <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e3e9f1; padding: 32px 24px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #2563eb; margin: 0; font-size: 1.5rem;">Verify Your Email</h2>
              </div>
              <p style="color: #222; font-size: 1.1rem; margin-bottom: 18px;">Hi,</p>
              <p style="color: #222; font-size: 1.1rem; margin-bottom: 18px;">Thank you for signing up with <b>Bianca Aesthetic Helpdesk</b>! Please verify your email address to activate your account.</p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${actLink}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 6px; font-size: 1.1rem; letter-spacing: 0.5px;">Verify Email</a>
              </div>
              <p style="color: #666; font-size: 0.95rem;">If you did not create an account, you can safely ignore this email.</p>
              <hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #e3e9f1;" />
              <p style="color: #b0b8c1; font-size: 0.9rem; text-align: center;">&copy; ${new Date().getFullYear()} Bianca Aesthetic Clinic</p>
            </div>
          </div>
        `;
        await sendOTP(email, "OTP Sign Up Verification", emailBody);

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

        console.log("ariel giggers");
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
        return res.status(500).json({message: error.message});
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
                    id: login,
                    is_guest: false
                },
                include: [{
                    model: Staff,
                    attributes: ['role_id']
                }],
                attributes: ['id', 'staff_id', 'email', 'username', 'is_guest'],
                raw: true
            });

            console.log(`Pre-Staff_id: ${user.staff_id}`)

            if (!user.staff_id) {
                user.staff_id = 0
                user.Staff.role_id = 0
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
    const {email} = req.body

    try {
        // check for email validity
        if (!validateEmail(email)) return res.status(400).json({ message: "Invalid email" });

        // create otp token with user info
        const otpToken = createOTPToken({email: email});
        const actLink = `${process.env.BASE_URL}/api/user/enter-new-password/${otpToken}`;
        await sendOTP(email, "Reset Password Link", actLink);

        return res.status(200).json({message: "Successfully sent password reset link"});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const enterNewPass = async (req, res) => {
    const token = req.params.token
    const {password} = req.body
    try {
        if (!token) return res.status(401).json({message: "Token missing"})
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {email} = decode;

        const hashedPassword = await hashPassword(password)
        const [count, user] = await User.update({
            password: hashedPassword
        }, {
            where: {
                email: email
            },
            returning: true
        })

        if (count === 0) return res.status(400).json({message: "User does not exist"})
        // audit here
        await logAudit(
            'Update',
            user[0].id,
            `User ${user[0].id} updated passwords`
            
        )
        return res.status(200).json({message: "Successfully updated like a heck!"})
    } catch(error) {
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
    const {id} = req.user;
    const {title, category_id, description} = req.body;
    try {
        if (!title || !description || !category_id) {
            return res.status(400).json({message: "Title and description fields need to be filled"});
        };  

        const ticket = await Ticket.create({
            user_id: id,
            category_id: category_id,
            status_id: 1,
            subject: title,
            description: description
        }, {raw: true});
        
        await logAudit(
            "Create",
            id,
            `Ticket ID ${ticket.id} created`
        );

        return res.status(200).json({message: "Ticket successfully created",
            ticket_id: ticket.id,
            title: ticket.subject,
            created_at: ticket.createdAt,
            email: req.user.email
        })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// edit ticket details if pending
export const editTicket = async (req, res) => {
    // needs to be a route parameter
    const id = req.params.id
    // still have user auth so get user id from there 
    const user_id = req.user.id

    const {title, category_id, description} = req.body
    console.log("Here 5")
    try {
        const ticket = await Ticket.update({
            ...(title ? {subject: title} : {}),
            ...(category_id ? {category_id: category_id} : {}),
            ...(description ? {description: description} : {})
        }, {
            where: {
                id: id,
                user_id: user_id
            },
            raw: true
        });

        await logAudit(
            "Update",
            user_id,
            `Ticket ID ${id} updated
            ${title ? `title -> ${title}` : ""}
            ${category_id ? `category_id -> ${category_id}` : ""}
            ${description ? `description -> ${description}` : ""}`
        )

        return res.status(200).json({message: "Successfully updated ticket"});
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const cancelTicket = async (req, res) => {
    const id = req.params.id
    const user_id = req.user.id
    try {
        // update the ticket
        const ticket = await Ticket.update({
            status_id: 4
        }, {
            where: {
                id: id,
                user_id: user_id,
                status_id: 1 // will only cancel the ticket if pending 
            },
            raw: true
        });

        // audit 
        await logAudit(
            "Update",
            user_id,
            `Update on Ticket ID ${id} status_id -> 4`
        )

        return res.status(200).json({message: "Successfully cancelled ticket"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// gets user ticket details
export const getUserTickets = async (req, res) => {
    const userId = req.user.id; // req.user is set by userAuthZ middleware
    const status = req.query.status;
    const search = req.query.search;

    try {
        const tickets = await Ticket.findAll({
            include: [{
                model: Category,
                attributes: ['name'],
                required: true
            },{
                model: Status,
                attributes: ['name'],
                required: true
            }],
            where: { 
                user_id: userId,
                ...(search ? 
                    {[Op.or] : 
                        [{subject: {[Op.substring]: search}},
                        {description: {[Op.substring]: search}},
                        ...(!isNaN(search) ? [{id: parseInt(search)}] : [])
                    ]
                    } 
                        : {}),
                ...(status ? {'$Status.name$': status} : {})
            },
            attributes: ['id', 'subject', 'description', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ tickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
