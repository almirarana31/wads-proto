import { Staff, User, Ticket, Status, Category, Priority } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';
import { logAudit } from './audit.js';

// tickets that have been assigned to the staff
export const getTickets = async (req, res) => {
    // search and filter parameters
    const search = req.query.search
    const priority = req.query.priority
    const status = req.query.status

    // get staff info from the middleware
    const staff = req.staff
    try {

        const tickets = await Ticket.findAll({
            include: [{
                model: Category,
                attributes: ['name'],
                required: true
            }, {
                model: Priority,
                attributes: ['name'],
                where: priority && priority.toLowerCase() !== 'all' ? {name: status} : null,
                required: true
            }, {
                model: Status,
                attributes: ['name'],
                where: status && status.toLowerCase() !== 'all' ? {name: status} : null,
                required: true
            }, {
                model: User,
                attributes: ['username', 'email'],
                as: 'User',
                required: true
            }],
            where: {
                staff_id : staff.staff_id, // where assigned staff == staff_id
                ...(search ? 
                    {[Op.or] : [
                        {subject: {[Op.substring]: search}},
                        {'$User.username$': {[Op.substring]: search}},
                        {'$User.email$': {[Op.substring]: search}},
                        {description: {[Op.substring]: search}},
                        ...(!isNaN(search) ? [{id: parseInt(search)}] : [])
                    ]}
                : {})
            },
            attributes: [['id', 'ticket_id'], 'subject', 'createdAt']
        })

        return res.status(200).json(tickets);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const getTicketPool = async (req, res) => {
    const priority = req.query.priority
    const staff = req.staff // uses staffAuthZ middleware
    const staff_field = req.staff_field // field id
    try{
        // get Tickets where the staff's field id 
        const tickets = await Ticket.findAll({
            where: {
                field_id: staff_field,
                status_id: 1
            },
            include: [{
                model: Priority,
                attributes: ['id', 'name'],
                required: true
            }],
            order: [
                ['$Priority.id$', 'DESC'], // order by highest priority (1 > 2 > 3)
                ['createdAt', 'ASC'] // if equal, sort by oldest
            ] 
        });

    } catch (error) {

    }
}

export const getSummary = async (req, res) => {
    try {
        const [results] = await sequelize.query(
        `
        SELECT 
            COUNT (t.id) AS assigned,
            SUM (CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) AS in_progress,
            SUM (CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) AS resolved
        FROM "staff" s LEFT JOIN "ticket" t ON s.id = t.staff_id
        `
        );

        return res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};