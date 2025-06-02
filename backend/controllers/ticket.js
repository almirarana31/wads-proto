import { Staff, User, Ticket, Status, Category, Priority } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';

// view ticket detail
// this uses a staff/admin auth
export const getTicketDetail = async (req, res) => {
    // get ticket id from route params
    const ticket_id = req.params.id

    // role id, if 2 admin if 1 starff
    const role_id = req.role_id;
    const user = req.user;

    // play around with the auth's next body
    // if the user that is sent with the body is not a staff, then the response should not contain priority

    try {
        const allowed = await Ticket.findOne({
            where: {
                id: ticket_id,
                [Op.or]: [
                    ...(user ? [{staff_id: user.staff_id}] : []),
                    ...(user ? [{user_id: user.id}] : [])
                ]
            }
        })

        const checkAdm = await Staff.findOne({
            where: {
                id: user.staff_id,
                role_id: 2
            }
        })

        let isAdmin = false
        if (checkAdm) isAdmin = true

        const ticket = await Ticket.findOne({
            where: {
                id: ticket_id
            },
            include: [{
                model: Status,
                attributes: ['name']
            }, {
                model: Category,
                attributes: ['name']
            }, ...(user.staff_id ? [{
                model: Priority,
                attributes: ['name']
            }] : []), ...(user.staff_id ? [{
                model: Staff,
                as: 'Staff',
                include: [{
                    model: User,
                    attributes: [['username', 'staff_name']]
                }],
                attributes: ['id']
            }] : []),
        {
            model: User,
            as: 'User',
            attributes: ['username', 'email', 'is_guest'],
            required: true
        }],
            attributes: ['id', 'subject', 'description', 'createdAt', 'note']
        });

        if (isAdmin || allowed) {
            return res.status(200).json(ticket)
        }

        return res.status(400).json({message: "Access denied"})
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

export const getRole = async (req, res) => {
    try {
        const roles = await Role.findAll({
            raw: true,
            attributes: ['id', 'name']
        })

        return res.status(200).json(roles)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// add note to ticket
export const addNote = async (req, res) => {
    // ticket id from the query
    const ticket_id = req.query.id
    // get staff id from the auth
    const staff = req.staff
    // not content
    const {note} = req.body 
    try {
        // update ticket where staff_id = staff_id
        const ticket = await Ticket.update({
            note: note
        }, {
            where: {
                staff_id: staff.staff_id
            }
        })

        // if ticket empty does not exist return 400 error
        if (!ticket) return res.status(400).json({message: "Ticket does not exist"})

        return res.status(200).json({message: "Note successfully added"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
} 

export const escalatePriority = async () => {
    try {
        const tickets = await Ticket.findAll({
            where: {
                createdAt: {[Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000)},
                priority_id: {[Op.lt]: 3}
            }
        })

        for (const ticket of tickets) {
            ticket.priority_id += 1;
            await ticket.save();
        }
        
    } catch (error) {
        console.log(error.message)
    }
};