import { Staff, User, Ticket, Status, Category, Priority } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';

// view ticket detail
// this uses a staff/admin auth
export const getTicketDetail = async (req, res) => {
    // get ticket id from route params
    const ticket_id = req.params.id

    // get staff_id from the body (gained from the request maker)
    const staff_id = req.staff_id;

    // play around with the auth's next body
    // if the user that is sent with the body is not a staff, then the response should not contain priority

    try {
        const ticket = await Ticket.findByPk(ticket_id, {
            raw: true,
            include: [{
                model: Status,
                attributes: ['name']
            }, {
                model: Category,
                attributes: ['name']
            }, {
                model: Priority,
                attributes: ['name']
            }, ...(staff_id ? {
                model: Staff,
                include: [{
                    model: User,
                    attributes: [['username', 'staff_name']]
                }]
            } : {})],
            attributes: ['id', 'subject', 'description', 'createdAt']
        });

        return res.status(200).json(ticket);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

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