import { Staff, User, Ticket, Status, Category, Priority, Conversation, Message } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';
import { logAudit } from './audit.js';

// get conversation 

// on change reset this page and call this function again
export const getConversation = async (req, res) => {
    // YOU will always be the requester
    // run this function by userAuthZ and staffAuthZ
    // if sender_id = token's user_id, isSender = true >> make it blue text bbl otherwise, false
    const conversation_id = req.params.conversationID
    const user = req.user
    try {   
        // get the conversation object from the database 
        const conversation = await Conversation.findOne({
            where: {
                id: conversation_id
            },
            include: [{
                model: Ticket,
                attributes: ['user_id', 'staff_id'],
                required: true
            }]
        })
        console.log(conversation)
        // checking to see if belongs to the conversation // slapstick solution should kill myself
        const isStaff = user?.staff_id == conversation.Ticket.staff_id;
        const isUser = user?.id == conversation.Ticket.user_id;
        // now to check for admin
        const admin = await Staff.findOne({
            where: {
                id: user.staff_id,
                role_id: 2
            }
        })

        let isAdmin = false
        if (admin) {
            isAdmin = true
        } 
        if ((!isStaff && !isUser) && !isAdmin) {
            return res.status(403).json({message: "Forbidden access!"})
        }

        // get messages with this conversation id 
        const messages = await Message.findAll({
            where: {
                conversation_id: conversation_id,
            }, 
            include: [{
                model: User,
                attributes: ['username', 'staff_id'],
                required: true
            }, {
                model: Conversation,
                attributes: ['closed']
            }],
            order: [['sentAt', 'ASC']]
        });

        const isClosed = await Conversation.findByPk(conversation_id,
            {
                attributes: ['closed']
            }
        )

        if (isAdmin) {
            const result = messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sentAt: msg.sentAt,
                sender_id: msg.sender_id,
                sender_username: msg.User.username,
                isSender: msg.User.staff_id ? true : false,
            }));
            result[result.length] = isClosed
            return res.status(200).json(result)
        }

        const result = messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sentAt: msg.sentAt,
            sender_id: msg.sender_id,
            sender_username: msg.User.username,
            isSender: msg.sender_id === user.id,
        }));
        result[result.length] = isClosed
        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};  
 
export const getConversationHistory = async (req, res) => {
    const ticket_id = req.params.ticketID
    const sortBy = req.query.sortBy // newest/oldest
    try {
        const conversation = await Conversation.findAll({
            include: [{
                model: Ticket,
                attributes: ['user_id', 'staff_id'],
                required: true
            }],
            where: {
                ticket_id: ticket_id
            },
            attributes: ['id', 'createdAt', 'endedAt', 'closed'],
            order: [['createdAt', sortBy?.toLowerCase() === 'newest' ? 'DESC' : 'ASC']]
        });
        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const sendMessage = async (req, res) => {
    const conversation_id = req.params.conversationID
    const user = req.user
    const content = req.body.content
    try {
        const isOpen = await Conversation.findByPk(conversation_id);

        // endedAt is typically null, if has date then it means ended
        if (isOpen.endedAt) return res.status(400).json({message: "Conversation closed"});

        // send message
        const message = await Message.create({
            conversation_id: conversation_id,
            sender_id: user.id,
            content: content,
            sentAt: new Date(Date.now())
        });

        return res.status(200).json({message: "message successfully sent"})
    }catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// uses staffAuthZ middleware
export const createConversation = async (req, res) => {
    const ticket_id = req.params.ticketID
    const staff = req.staff;

    try {
        // check if staff is assigned to the ticket
        const assigned = await Ticket.findOne({
            where: {
                id: ticket_id,
                staff_id: staff.staff_id
            },
            raw: true
        })
        if (assigned.status_id ===3 || assigned.status_id === 4) return res.status(400).json({message:"Ticket is already closed. Get banned"})

        const hasOne = await Conversation.count({
            where: {
                ticket_id: ticket_id,
                closed: [false, null]
            }
        })

        const conversation = await Conversation.findOne({
            where: {
                ticket_id: ticket_id,
                closed: true
            }
        })
        console.log(hasOne)

        // if a conversation exists, and it is closed
        if (conversation) {
            if (conversation.closed) {

                // if conversation in the ticket is already closed, and the "create" endpoint is called,
                // reopens the conversation
                await Conversation.update({
                    closed: false
                }, {
                    where: {
                        ticket_id: ticket_id,
                        id: conversation.id
                }
            })
            }
            // audit here
            await logAudit(
                "Create",
                staff.id,
                `
                Conversation ID ${conversation.id} re-opened
                `
            )
            return res.status(200).json({message: "Conversation re-opened"})
        }

        if (!assigned) return res.status(403).json({message: "Staff is not assigned to this ticket"})
        
        // if a conversation exists, but isn't closed, ban the user 
        if (hasOne > 0) {
            return res.status(400).json({message: "Conversation has already been started"})
        }

        // no converation exists
        const newConvo = await Conversation.create({
            ticket_id: assigned.id,
            endedAt: null,
            closed: false
        })

        // audit here
        await logAudit(
            "Create",
            staff.id,
            `
            Conversation ID ${newConvo.id} created
            `
        )

        return res.status(200).json({messager: "Successfully created conversation"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const closeConversation = async (req, res) => {
    // get conversation id
    const conversation_id = req.params.conversationID
    const staff = req.staff
    try {
        // do conversationAuthZ middleware and staffAuthZ middleware
        const closed = await Conversation.update({
            endedAt: new Date(Date.now()),
            closed: true
        }, {
            where: {
                id: conversation_id
            }
        });
        
        // audit here
        await logAudit(
            'Update',
            staff.id,
            `
            Conversation ID ${conversation_id} closed
            `
        )
        
        return res.status(200).json({message: "Conversation successfully closed"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}