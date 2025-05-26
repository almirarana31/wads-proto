import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Staff, User, Ticket, Status, Category, Priority } from '../models/index.js';
import dotenv from 'dotenv';
import sessionStorage from 'sessionstorage';
import sequelize from '../config/sequelize.js';
import { Op, Sequelize } from 'sequelize';

// get category
const getCategory = async (body) => {
    let result = body;

    // getting category id to name mapping
    const categories = await Category.findAll({
        attributes: [
            'name'
        ]
    });

    for (let i = 0; i < body.length; i++) {
        // get category id
        const temp = body[i].category;
        // set status as status name where index = id (- 1); status is always +1 of index
        result[i].category = categories[temp - 1].name;
    };

    return result;
};

// get status
const getStatus = async (body) => {
    let result = body;

    // getting status id to name mapping
    const statuses = await Status.findAll({
        attributes: [
            'name'
        ],
        raw: true
    });

    for (let i = 0; i < body.length; i++) {
            // get status id
            const temp = body[i].status; 
            // set status as status name where index = id (- 1); status is always +1 of index
            result[i].status = statuses[temp - 1].name;
        }
    return result;
};

export const getAdminUsername = async (req, res) => {
    const {username} = req.user;
    try {
        // admin info attached to request body through the authZ
        return res.status(200).json(username);
    } catch (error) {
        return res.status(500).json({message: error.message});
    };
};

export const getStatusSummary = async (req, res) => {
    try {
        // get count status from the ticket table
        const result = await Ticket.findAll({
            include: [{
                model: Status,
                attributes: []
            }],
            group: ['Status.name'],
            attributes: ['Status.name', [sequelize.fn('COUNT', sequelize.col('Status.name')), 'count']],
            raw: true
        });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// i don't remember why i needed this????
export const getCategorySummary = async (req, res) => {
        try {
        // get count status from the ticket table
        let result = await Ticket.findAll({
        attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('category')), 'count']
        ],
        group: ['category'],
        raw: true
        });

        result = await getCategory(result);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

// get ticket join
export const getTickets = async (req, res) => {
    const priority = req.query.priority;
    const category = req.query.category; 
    const status = req.query.status;
    const search = req.query.search;

    try {
        const result = await Ticket.findAll({
        include: [{
            model: Category,
            where: category && category.toLowerCase() !== 'all' ? {name: category} : null, // if category exists in query and isn't all, sort by category
            attributes: ['name']
        }, {
            model: Status,
            where: status && status.toLowerCase() !== 'all' ? {name: status} : null,    // same as category
            attributes: ['name'],
        }, {
            model: Priority,
            where: priority && priority.toLowerCase() != 'all' ? {name: priority} : null, // same as category
            attributes: ['name'] 
        }, {
            model: User,
            as: 'User',
            attributes: ['username', 'email']
        }],
        attributes: [['id', 'ticket_id'], 'subject', 'createdAt'],
        raw: true,
        // if search exists, spread the where clause into this query
        ...(search && // can probably optimize the writing of this section of code, but will try to see if this version works first
                {where: isNaN(search) ? 
                    {[Op.or]: // if search is not a number, stick to username and email only
                        [{subject: {[Op.substring]: search}},
                         {'$User.username$': {[Op.substring]: search}},
                         {'$User.email$': {[Op.substring]: search}}
                        ]
                    } :
                {[Op.or]: [{subject: {[Op.substring]: search}}, // if search is a number, include the search to id
                         {'$User.username$': {[Op.substring]: search}},
                         {'$User.email$': {[Op.substring]: search}},
                         {id: parseInt(search)}
                        ]} })
    });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// staff performance a.k.a.
export const getStaffPerformance = async (req, res) => {
    try {
        // get all userID (staffID) where email matches
        const allStaffID = await User.findAll({
            raw: true,
            attributes: ['id', 'email'],
            includes: [{
                model: Staff,
                attributes: ['email']
            }],
            where: {
                email: sequelize.col('Staff.email')
            }
        });

        // find all tickets where staffID === userID in user table 
        // now have username x ticket
        const results = await Ticket.findAll({
            include: [{
                model: Status,
                attributes: ['name'],
                where: {name: {[Op.ne]: "In Progress"}}
            },{
                model: Staff,
                attributes: ['email']
            },
            {
                model: User,
                attributes: ['username', 'id']
            }],
            attributes: ['id'],
            where: {
                '%User.id%': sequelize.col('staffID') 
            },
            raw: true,
            attributes: [[sequelize.fn('COUNT', 'Status.name'), 'count']],
            group: ['Status.name']
        })

        let assigned = 0;
        let resolved = 0;
        for (let i = 0; i < results.length; i++) {
            if (results[i]['Status.name'] != "Resolved") {
                assigned += results[i].count
            } else {
                resolved += results[i].count
            }
        }

        const division = {
                assigned: assigned,
                resolved: resolved,
                resolution_rate: (resolved/assigned) * 100
        }

        return res.status(200).json(division);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};