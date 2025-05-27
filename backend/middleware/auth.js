import jwt from 'jsonwebtoken';
import {Staff} from '../models/index.js';

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
            return res.status(403).json({message: "Forbiddne access"})
        }

        req.staff = user;
        return next();
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// user authZ
export const userAuthZ = async (req, res, next) => {

    try {
        const token = req.headers.authorization?.split(" ")[1];
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!token) {
            return res.status(403).json({message: "Forbidden Access"})
        }

        const {id, email, username, is_guest} = user;

        if(is_guest) {
            return res.status(403).json({message: "Forbidden Access"})
        }

        req.user = user // id, email, username, is_guest

        return next();
        // unlikely to occur, will be net for outliers
        
    } catch (error) {
        return res.status
    }
};