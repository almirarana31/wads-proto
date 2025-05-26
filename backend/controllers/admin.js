import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Staff, User, Ticket, Status, Category, Priority } from '../models/index.js';
import dotenv from 'dotenv';
import sessionStorage from 'sessionstorage';
import sequelize from '../config/sequelize.js';
import { Op, Sequelize } from 'sequelize';

// dash board begins here
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
        ...(search && 
                    {[Op.or]: 
                        [{subject: {[Op.substring]: search}},
                         {'$User.username$': {[Op.substring]: search}},
                         {'$User.email$': {[Op.substring]: search}},
                         ...(!isNaN(search) && [{id: parseInt(search)}]) // if search is a number, extend search to id
                        ]
                    })
    });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// staff performance a.k.a.
export const getStaffPerformance = async (req, res) => {
    try {
        const [results] = await sequelize.query(
            `
            SELECT u.username AS staff_name,
            COUNT (t.id) AS assigned,
            SUM (CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) AS resolved,
            ROUND(
            CASE 
                WHEN COUNT (t.id) = 0 THEN 0
                ELSE SUM (CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) * 100.0/COUNT (t.id)
            END, 2) AS resolution_rate
            FROM "user" u 
            INNER JOIN "staff" s ON u.staff_id = s.id
            LEFT JOIN "ticket" t ON s.id = t.staff_id
            GROUP BY u.username
            `
        );
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// dashboard ends here
