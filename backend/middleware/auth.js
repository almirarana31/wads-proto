import jwt from 'jsonwebtoken';
import {Staff, User, Conversation, Ticket} from '../models/index.js';
import { logAudit } from '../controllers/audit.js';

export const authN = (req, res, next) => {
    try {
        // get the token from the header if exists => bearer {token}
        const token = req.headers.authorization?.split(" ")[1];

        // verify token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({message: "Token Expired or Invalid Authentication"});
            
            // otherwise, IS a user, proceed
            return next()
        })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const adminAuthZ = async (req, res, next) => {
    try {
        // get the token from the header if exists => bearer {token}
        const token = req.headers.authorization?.split(" ")[1];

        // check for access token existence
        if(!token) {
            return res.status(401).json({message: "Access token missing"});
        }
    
        // verify token
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {staff_id} = user;

        // if not a staff, reject
        if (staff_id == 0) {
            return res.status(403).json({message: "Access Denied"});
        }

        // get staff info 
        const staff = await Staff.findByPk(staff_id, {raw: true})

        if (staff.role_id != 2) {
            return res.status(403).json({message: "Access Denied"});
        }
        
        req.user = user; // user contains, uid, sid, email, uname
        req.admin = staff; // admin contains all admin fields
        return next();
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// soft authz
export const softAuthZ = async (req, res, next) => {
    try {
         // get the token from the header if exists => bearer {token}
        const token = req.headers.authorization?.split(" ")[1];

        // check for access token existence
        if(!token) {
            return res.status(401).json({message: "Access token missing"});
        }

        // verify token
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {staff_id} = user;

        // if is staff, attach user to request body
        if (staff_id != 0) {
            req.staff = user
        } 

        return next();
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// staff authz
export const staffAuthZ = async (req, res, next) => {
    try {
        // get the token from the header if exists => bearer {token}
        const token = req.headers.authorization?.split(" ")[1];

        // check for access token existence
        if(!token) {
            return res.status(401).json({message: "Access token missing"});
        }

         // verify token
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {staff_id} = user;

        // not a staff
        if (staff_id == 0) {
            return res.status(403).json({message: "Forbidden access"})
        }

        const staff = await Staff.findOne({
            where: {
                id: user.staff_id // get staff detail where id == staff_id
            },
            raw: true
        });

        req.staff = user;
        req.role_id = staff.role_id;
        req.staff_field = staff.field_id;
        return next();
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// checks for guests
export const guestAuthZ = async (req, res, next) => {
    const {email} = req.body;
    try{
        const token = req.headers.authorization?.split(" ")[1];

        if(token) {
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = user
            return next();
        }
        
        // if token doesn't exist >> means guest user, create (1. check for existing email, 2. create)
        const exists = await User.findOne({
            where: {
                email: email
            },
            raw: true
        });
        // guest has submitted before
        if (exists && exists.is_guest) {
            req.user = exists
            return next()
        } 
        else if (exists && !exists.is_guest) {
            return res.status(400).json({message: "Email is verified. Please log in"})
        }
        
        const guestUser = await User.create({
            email: email,
            is_guest: true
        }, {raw: true});

        await logAudit(
            "Create",
            guestUser.id,
            `Guest account created (email: ${email})`
        )
        
        req.user = guestUser;
        return next();
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

// user authZ
export const userAuthZ = async (req, res, next) => {

    try {
        const token = req.headers.authorization?.split(" ")[1];
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!token) {
            return res.status(403).json({message: "Forbidden Access"})
        }

        const {is_guest} = user;

        if(is_guest) {
            return res.status(403).json({message: "Guests cannot log in"});
        }
        
        req.user = user // id, email, username, is_guest
        return next();
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const conversationAuthZ = async (req, res, next) => {

    // get the conversation id
    const id = req.params.id
    const staff = req.staff
    const user = req.user
    try {
        // get the conversation object from the database 
        const conversation = await Conversation.findByPk(id, {
            include: [{
                model: Ticket,
                attributes: ['user_id', 'staff_id'],
                required: true
            }],
        })
        // checking to see if belongs to the conversation // slapstick solution should kill myself
        const isStaff = staff?.staff_id == conversation.Ticket.staff_id || user.staff_id == conversation.Ticket.staff_id;
        const isUser = user?.id == conversation.Ticket.user_id;

        // if person accessing is neither staff that belongs nor user that belongs to the conversation
        if (!isStaff && !isUser) {
            return res.status(404).json({ message: "You do not have permission to access this conversation" });
        }

        req.staff_id = conversation.Ticket.staff_id
        req.user_id = conversation.Ticket.user_id

        return next();
    } catch (error) {
        return res.status(500).json({message: error.message})
    } 
}
export const getUserRoles = async (req, res) => {

    try {
        // decode jwt
        const token = req.headers.authorization?.split(" ")[1];
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const {id, staff_id} = decode

        const staff = await Staff.findOne({
            where: {
                ...(staff_id ? {id: staff_id} : {})
            },
            attributes: ['role_id']
        })

        if (!staff) {
            return res.status(200).json({
                isUser: true,
                isStaff: false,
                isAdmin: false
            })
        }
        if (staff.role_id === 1) {
            return res.status(200).json({
                isUser: false,
                isStaff: true,
                isAdmin: false
            })
        }
        if (staff.role_id === 2) {
            return res.status(200).json({
                isUser: false,
                isStaff: false,
                isAdmin: true
            })
        }

        return res.status(400).json({message: "Invalid token"})
    } catch(error) {
        return res.status(500).json({message: error.message})
    }
}