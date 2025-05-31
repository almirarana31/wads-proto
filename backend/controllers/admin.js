import { Staff, User, Ticket, Status, Category, Priority, Assignment } from '../models/index.js';
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
    const staff_id = req.params.id
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
    const staff_id = req.params.id 
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
const roundRobinAssignment = async (ticket_id, category_id, admin_id) => {
    try {
        // get all staff
        const staffs = await Staff.findAll({
            where: {
                field_id: category_id
            },
            raw: true
        })

        const assignment = await Assignment.findOne({
            where: {
                category_id: category_id
            },
            raw: true
        })

        const last_staff = assignment?.last_staff
        const lastIndex = staffs.findIndex(staff => staff.id === last_staff); // returns -1 if last_staff doesnt exist

        for (let i = 1; i <= staffs.length; i++) {
            const index = (lastIndex + i) % staffs.length

            const count = await Ticket.count({
                where: {
                    staff_id: staffs[index].id,
                    status_id: {[Op.notIn]: [4, 3]} // not resolved, not cancelled
                }
            })

            if (count < 3) {
                // update the ticket
                const ticket = await Ticket.update({
                    status_id: 2,
                    staff_id: staffs[index].id
                }, {
                    where: {
                    id: ticket_id
                  }
                })

                // update the assignment
                if (last_staff) {
                    assignment.last_staff = staffs[index].id
                    await assignment.save();
                    // audit
                    await logAudit(
                        'Update',
                        admin_id,
                        `
                        Ticket ID ${ticket_id} assigned to staff ID ${staffs[index].id}
                        `
                    )
                    return true
                }

                const newAssignment = await Assignment.create({
                    category_id: category_id,
                    last_staff: staffs[index].id
                })

                // audit
                await logAudit(
                    'Update',
                    admin_id,
                    `
                    Ticket ID ${ticket_id} assigned to staff ID ${staffs[index].id}
                    `
                )
                return true // if true ticket has been automatically assigned
            }
            
            // if false res.status(200).json({message: "Ticket sent to the ticket pool"})
            return false
        }
    } catch(error) {
        console.log(error.message)
    }
}

// update ticket fields
export const updateField = async (req, res) => {
    // get updated fields (only one will have a value at a time)
    // const {category_id, priority_id, status_id} = req.body
    const {priority_id} = req.body
    // get the selected ticket by route params
    const ticket_id = req.params.id
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

        // auto assign ticket

        const robin = await roundRobinAssignment(ticket_id, ticket[0].category_id, admin.id)

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
    const ticket_id = req.params.ticket_id;
    try {
        // First get the ticket's category
        const ticket = await Ticket.findByPk(ticket_id, {
            include: [{
                model: Category,
                attributes: ['id']
            }]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Get staff with matching field_id and their performance metrics
        const [staffList] = await sequelize.query(`
            SELECT 
                s.id as staff_id,
                u.username as staff_name,
                s.field_id,
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
            WHERE s.field_id = :category_id
            GROUP BY s.id, u.username, s.field_id, u.is_guest
        `, {
            replacements: { category_id: ticket.Category.id },
            type: sequelize.QueryTypes.SELECT
        });

        console.log('Ticket category:', ticket.Category.id);
        console.log('Found staff:', staffList);

        res.json(staffList);
    } catch (error) {
        console.error('Error in searchStaff:', error);
        res.status(500).json({ message: 'Server error' });
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
    
    const staff_id = req.params.id
  
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
