import { Staff, User, Ticket, Status, Category, Priority, Assignment } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';
import { logAudit } from './audit.js';
import sendOTP from './otp.js';

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
    const {category_id, search} = req.query
    try {
        let whereClause = 's.role_id != 2'
        const replacements = {}
        if (category_id) {
            whereClause += ' AND s.field_id = :category_id'
            replacements.category_id = Number(category_id);
        }
        if (search) {
            whereClause += ' AND (u.username ~* :search '
            if (!isNaN(search)) {
                whereClause += ' OR u.id = :search OR s.id = :search'
                replacements.searchId = Number(search);
            }
            whereClause += ')'
        }
        const [results] = await sequelize.query(
            `
            SELECT 
                u.username AS staff_name,
                u.id AS user_id,
                s.id AS staff_id,
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
            WHERE (${whereClause})
            GROUP BY u.username, u.id, s.id
            `,
            {
                replacements: {
                    category_id: category_id,
                    search: search
                }
            }
        );

        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

export const getStaff = async (req, res) => {
    
    // get the user_id of the staff from the staff-performance as a route parameter
    const staff_id = req.params.staffID
    try {
        const [results] = await sequelize.query(
            `
            SELECT 
                u.username AS staff_name,
                c.name AS field_name,
                s."createdAt" AS created_at,
                SUM (CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) AS in_progress,
                SUM (CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) AS resolved,
                SUM (CASE WHEN t.status_id = 4 THEN 1 ELSE 0 END) AS cancelled
            FROM 
                "user" u 
                LEFT JOIN "staff" s ON u.staff_id = s.id
                LEFT JOIN "ticket" t ON s.id = t.staff_id
                LEFT JOIN "category" c ON s.field_id = c.id
            WHERE (s.id = ${staff_id})
            GROUP BY u.username, c.name, s."createdAt"
            `
            );
        return res.status(200).json(results)   
    } catch (error){
        return res.status(500).json({message: error.message})
    }
}

export const editStaff = async (req, res) => {
    const staff_id = req.params.staffID
    const admin = req.user
    const {category_id, is_guest} = req.body
    try {
        const staff = await Staff.update({
            ...(category_id ? {field_id: category_id} : {})
        }, {
            where: {
                id: staff_id
            }
        })

        const user = await User.update({ 
            // ...(is_guest ? {is_guest: true} : {is_guest:false})
            is_guest: is_guest 
        },
            {
                where: { staff_id: staff_id },
                returning: true
            }
        ) 

        // audit here
        await logAudit(
            'Update',
            admin.id,
            `
            Staff ID ${staff_id} updated
            `
        )

        return res.status(200).json({message: "Successfully editted staff"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

// ticket actions start here

// update ticket fields
export const updateField = async (req, res) => {
    // get updated fields (only one will have a value at a time)
    // const {category_id, priority_id, status_id} = req.body
    const {priority_id} = req.body
    // get the selected ticket by route params
    const ticket_id = req.params.ticketID
    const admin = req.user
    try {
        // update 
        const [count, ticket] = await Ticket.update({
            // ...(category_id && {category_id: category_id}),
            ...(priority_id && {priority_id: priority_id}),
            // ...(status_id && {status_id: status_id})
        }, {
            where: {
                id: ticket_id,
                priority_id: {[Op.or]: [{[Op.ne]: priority_id}, null]} // could be where priority_id: 1 instead will have to consult the rest
            },
            returning: true
        });
        
        if (count === 0) return res.status(400).json({message: "No row updated"});

        await logAudit(
            "Update",
            req.user.id,
            `Ticket ID ${ticket_id} fields updated priority_id: ${priority_id} `
        );

        const newTick = await Ticket.findByPk(ticket[0].id)

        return res.status(200).json(newTick);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// get staff (used for assigning)
export const searchStaff = async (req, res) => {
    const ticket_id = req.params.ticketID;
    try {
        // First get the ticket's details including its assigned staff and category
        const ticket = await Ticket.findOne({
            where: { id: ticket_id },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name'],
                    required: true
                },
                {
                    model: Staff,
                    attributes: ['id', 'field_id'],
                    include: [
                        {
                            model: User,
                            attributes: ['username', 'is_guest']
                        }
                    ]
                }
            ]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (!ticket.Category) {
            return res.status(400).json({ message: 'Ticket category not found' });
        }

        // If there's already a staff assigned to this ticket, return their info first
        if (ticket.Staff) {
            const [assignedStaff] = await sequelize.query(`
                SELECT 
                    s.id as staff_id,
                    u.username as staff_name,
                    s.field_id,
                    c.name as field_name,
                    u.is_guest,
                    COUNT(t.id) as assigned,
                    SUM(CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) as resolved,
                    ROUND(
                        CASE 
                            WHEN COUNT(t.id) = 0 THEN 0
                            ELSE SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) * 100.0/COUNT(t.id)
                        END, 2
                    ) as resolution_rate
                FROM staff s
                INNER JOIN "user" u ON u.staff_id = s.id
                LEFT JOIN ticket t ON t.staff_id = s.id
                LEFT JOIN category c ON s.field_id = c.id
                WHERE s.id = :staff_id
                GROUP BY s.id, u.username, s.field_id, c.name, u.is_guest
            `, {
                replacements: { staff_id: ticket.Staff.id },
                type: sequelize.QueryTypes.SELECT
            });
            
            if (assignedStaff) {
                return res.json([assignedStaff]);
            }
        }

        // If no staff is assigned or the assigned staff wasn't found,
        // get staff with matching field_id and their performance metrics
        const [staffList] = await sequelize.query(`
            SELECT 
                s.id as staff_id,
                u.username as staff_name,
                s.field_id,
                c.name as field_name,
                u.is_guest,
                COUNT(t.id) as assigned,
                SUM(CASE WHEN t.status_id = 2 THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) as resolved,
                ROUND(
                    CASE 
                        WHEN COUNT(t.id) = 0 THEN 0
                        ELSE SUM(CASE WHEN t.status_id = 3 THEN 1 ELSE 0 END) * 100.0/COUNT(t.id)
                    END, 2
                ) as resolution_rate
            FROM staff s
            INNER JOIN "user" u ON u.staff_id = s.id
            LEFT JOIN ticket t ON t.staff_id = s.id
            LEFT JOIN category c ON s.field_id = c.id
            WHERE s.field_id = :category_id AND u.is_guest = false
            GROUP BY s.id, u.username, s.field_id, c.name, u.is_guest
            ORDER BY resolution_rate DESC, assigned ASC
        `, {
            replacements: { category_id: ticket.Category.id },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Ticket category:', ticket.Category.id);
        console.log('Found staff:', staffList);

        return res.json(staffList);
    } catch (error) {
        console.error('Error in searchStaff:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// assign staff to a ticket
export const assignStaff = async (req, res) => {
    const ticket_id = req.params.ticketID;
    const {id} = req.body;
    const admin = req.admin;

    try {
        // Validate the input
        if (!ticket_id || !id) {
            return res.status(400).json({ message: 'Ticket ID and Staff ID are required' });
        }

        // Check if the ticket exists and isn't already resolved
        const existingTicket = await Ticket.findOne({
            where: {
                id: ticket_id,
                status_id: {
                    [Op.ne]: 3 // not resolved
                }
            },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!existingTicket) {
            return res.status(404).json({ message: 'Ticket not found or already resolved' });
        }

        // Verify that the staff exists and has the correct field/category
        const staffMember = await Staff.findOne({
            where: {
                id: id,
                field_id: existingTicket.Category.id
            },
            include: [
                {
                    model: User,
                    attributes: ['username', 'is_guest'],
                    where: {
                        is_guest: false
                    }
                }
            ]
        });

        if (!staffMember) {
            return res.status(400).json({ message: 'Invalid staff assignment. Staff must be active and match ticket category.' });
        }

        // Update the ticket
        await existingTicket.update({
            staff_id: id,
            status_id: 2 // In Progress
        });

        // Log the audit
        await logAudit(
            "Update",
            req.user.id,
            `Ticket ${ticket_id} assigned to staff ${staffMember.User.username} (ID: ${id})`
        );

        // Return updated ticket with staff info
        return res.status(200).json({
            success: true,
            message: 'Ticket successfully assigned',
            ticket: {
                id: existingTicket.id,
                staff_id: id,
                staff_name: staffMember.User.username,
                status: 'In Progress'
            }
        });
    } catch (error) {
        return res.status(500).json({message: error.message})
    };
}

export const createStaff = async (req, res) => {
    const {email, field_id,  role_id} = req.body
    const admin = req.user
    try {
        const staff = await Staff.findOne({
            where: {
                email: email
            },
            raw: true
        })
        if (staff) return res.status(400).json({message: "Email already exists"})
        
        const new_staff = await Staff.create({
            email: email,
            field_id: field_id,
            role_id: role_id,
            job_id: null
        })

        // audit here
        await logAudit(
            'Create',
            admin.id,
            `
            Staff ${new_staff.id} created
            `
        )

        return res.status(200).json({message: "Successfully created new staff"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getAccStatus = async (req, res) => {
    
    const staff_id = req.params.adminID
  
    try {
        const user = await User.findOne({
            where: {
                staff_id: staff_id
            }, 
            attributes:['is_guest'],
            raw: true
        })
        
        return res.status(200).json(user) 
    } catch(error) {
        return res.status(500).json({message: error.message})
    }
}
