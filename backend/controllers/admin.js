import { Staff, User, Ticket, Status, Category, Priority } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';
import { logAudit } from './audit.js';

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

// get category
export const getCategory = async (req, res) => {
    try {
        const categories = await Category.findAll({
            raw: true,
            attributes: ['id', 'name']
        })
        return res.status(200).json(categories)
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}

// get priority
export const getPriority = async (req, res) => {
    try {
        const priorities = await Priority.findAll({
            raw: true,
            attributes: ['id', 'name']
        })
        return res.status(200).json(priorities)
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
};

// get status
export const getStatus = async (req, res) => {
    try {
        const statuses = await Status.findAll({
            raw: true,
            attributes: ['id', 'name']
        })

        return res.status(200).json(statuses)
    } catch(error) {
        return res.status(500).json({message:error.message})
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
        attributes: [['id', 'ticket_id'], 'subject', 'createdAt', 'note'],
        // if search exists, spread the where clause into this query
        where: {
            ...(search && 
                    {[Op.or]: 
                        [{subject: {[Op.substring]: search}},
                         {'$User.username$': {[Op.substring]: search}},
                         {'$User.email$': {[Op.substring]: search}},
                         ...(!isNaN(search) ? [{id: parseInt(search)}] : []) // if search is a number, extend search to id
                        ]
                    })  
        }
        
    });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// staff performance
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
            WHERE (s.role_id != 2)
            GROUP BY u.username
            `
        );
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// ticket actions start here

// update ticket fields
export const updateField = async (req, res) => {
    // get updated fields (only one will have a value at a time)
    // const {category_id, priority_id, status_id} = req.body
    const {priority_id} = req.body
    // get the selected ticket by route params
    const ticket_id = req.params.id
    try {
        // update 
        const ticket = await Ticket.update({
            // ...(category_id && {category_id: category_id}),
            ...(priority_id && {priority_id: priority_id}),
            // ...(status_id && {status_id: status_id})
        }, {
            where: {
                id: ticket_id
            },
            raw: true
        });

        // auto assign ticket

        await logAudit(
            "Update",
            req.user.id,
            `Ticket ID ${ticket_id} fields updated priority_id: ${priority_id ? priority_id: "no change"} `
        );

        return res.status(200).json(ticket);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// get staff (used for assigning)
export const searchStaff = async (req, res) => {
    const id = req.params.ticket_id
    const search = req.query.search
    try {
        // get ticket
        const ticket = await Ticket.findByPk(id, {raw: true});
        
        // get ticket category
        const category_id = ticket.category_id;
        const [stats] = await sequelize.query(
            `
            SELECT 
                s.id AS staff_id,
                u.username AS staff_name,
                SUM (CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) AS in_progress,
                ROUND(
                    CASE 
                        WHEN COUNT (t.id) = 0 THEN 0
                        ELSE SUM (CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) * 100.0/COUNT (t.id)
                    END, 2) AS resolution_rate
            FROM 
            "user" u INNER JOIN 
            "staff" s ON u.staff_id = s.id LEFT JOIN
            "ticket" t ON s.id = t.staff_id
            WHERE (t.category_id = ${category_id} AND s.role_id != 2 AND u.id != t.user_id)
            GROUP BY s.id, u.username
            `
        );

        return res.status(200).json(stats)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

// assign staff to a ticket
export const assignStaff = async (req, res) => {
    // get ticket id from route parameter
    const ticket_id = req.params.ticket_id
    // get selected staff info from the request body
    const {id} = req.body;
    const admin = req.admin;
    try {
        // update the staff assigned to the ticket and the status
        const ticket = await Ticket.update({
            staff_id: id,
            status_id: 2 // update to be in progress
        }, {
            where: {
                id: ticket_id
            },
            raw: true
        }
    );
        // audit here
        await logAudit(
            "Update",
            req.user.id,
        )
        return res.status(200).json(ticket)
    } catch (error) {
        return res.status(500).json({message: error.message})
    };
}

// dashboard ends here
