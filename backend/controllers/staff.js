import { Staff, User, Ticket, Status, Category, Priority, Conversation } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';
import { logAudit } from './audit.js';
import sendOTP from './otp.js';

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
                where: priority && priority.toLowerCase() !== 'all' ? {name: priority} : null,
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
                : {}),
                category_id: req.staff_field
            },
            attributes: [['id', 'ticket_id'], 'subject', 'createdAt']
        })

        return res.status(200).json(tickets);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const getTicketPool = async (req, res) => {
    const staff = req.staff // uses staffAuthZ middleware
    const staff_field = req.staff_field // field id
    try{
        // get Tickets where the staff's field id 
        console.log(staff_field)
        const tickets = await Ticket.findAll({
            where: {
                category_id: staff_field,
                status_id: 1
            },
            include: [{
                model: Priority,
                attributes: ['name'],
                required: true
            },
            {
                model: User,
                as: 'User',
                attributes: ['username', 'email'],
                required: true
            }],
            order: [
                ['priority_id', 'ASC'], // order by highest priority/lowest number (1 > 2 > 3)
                ['createdAt', 'ASC'] // if equal, sort by oldest
            ] 
        });

        return res.status(200).json(tickets)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

// uses staffAuthZ
export const claimTicket = async (req, res) => {
    
    const {ticket_id} = req.body
    const staff = req.staff
    try {
         // update
        const count = await Ticket.count({
            where: {
                staff_id: staff.staff_id,
                status_id: 2
            }
        })

        if (count === 5) {
            return res.status(400).json({message: "Staff is already assigned to 5 tickets!"})
        };
        
       
        const [ticket] = await Ticket.update({
            staff_id: staff.staff_id,
            status_id: 2
        }, {
            where: {
                id: ticket_id,
                user_id: {[Op.ne]: staff.id}
            },
            returning: true
        })

        if (!ticket) return res.status(401).json({message: "Cannot claim own ticket"});

        // audit here
        await logAudit(
            'Update',
            staff.id,
            `
            Ticket ${ticket_id} claimed for resolving; in progress
            `
        );

        return res.status(200).json(ticket)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getSummary = async (req, res) => {
    const staff = req.staff
    try {
        const [results] = await sequelize.query(
        `
        SELECT 
            COUNT (t.id) AS assigned,
            SUM (CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) AS in_progress,
            SUM (CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) AS resolved,
            SUM (CASE WHEN t.status_id = 4 THEN 1 ELSE 0 END) AS cancelled
        FROM "staff" s LEFT JOIN "ticket" t ON s.id = t.staff_id
        WHERE (s.id = ${staff.id})
        `
        );

        return res.status(200).json(results)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const resolveTicket = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id); // parse the ID to ensure it's a number
        
        if (isNaN(ticketId)) {
            return res.status(400).json({ message: 'Invalid ticket ID' });
        }

        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        // auto assign ticket 
        const userTicket = await Ticket.findOne({
            include: [{
                model: User,
                as: 'User',
                required: true
            }],
            where: {
                id: ticketId
            },
            attributes: ['User.email']
        })
        const email = userTicket.User.email
        const emailBody = `Ticket has been resolved. Thank you for using bianca ticketing service`;
        await sendOTP(email, "Ticket has been resolved", emailBody);

        // Update the ticket
        await ticket.update({
            status_id: 3, // sets status to resolved
            resolved_at: new Date(Date.now()),
            staff_id: req.staff.staff_id
        });

        const conversation = await Conversation.findAll({
            where: {
                ticket_id: ticketId
            }
        })

        for (const convo of conversation) {
            convo.closed = true;
            convo.endedAt = new Date(); // Add this line to set endedAt timestamp
            await convo.save();
        }
        

        // audit here
        await logAudit(
            'Update',
            req.staff.id,
            `Ticket ID ${ticketId} resolved`
        )

        return res.status(200).json({ 
            success: true,
            message: 'Ticket resolved successfully',
            ticket
        });
    } catch (error) {
        console.error('Error resolving ticket:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error resolving ticket',
            error: error.message 
        });
    }
};

export const cancelTicket = async (req, res) => {
    try {
        const ticketId = parseInt(req.params.id);
        
        if (isNaN(ticketId)) {
            return res.status(400).json({ message: 'Invalid ticket ID' });
        }

        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Update the ticket
        await ticket.update({
            status_id: 4, // set status to cancelled
            staff_id: req.staff.staff_id
        });

        const conversation = await Conversation.findAll({
            where: {
                ticket_id: ticketId
            }
        })

        for (const convo of conversation) {
            convo.closed = true;
            convo.endedAt = new Date(); // Add this line to set endedAt timestamp
            await convo.save();
        }
        
        // audit here
        await logAudit(
            'Update',
            req.staff.id,
            `Ticket ID ${ticketId} cancelled`
        )

        return res.status(200).json({ 
            success: true,
            message: 'Ticket cancelled successfully',
            ticket
        });
    } catch (error) {
        console.error('Error cancelling ticket:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error cancelling ticket',
            error: error.message 
        });
    }
};