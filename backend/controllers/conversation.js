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

    const conversation_id = req.params.id
    const user = req.user
    try {   
        // get messages with this conversation id 
        const messages = await Message.findAll({
            where: {
                conversation_id: conversation_id,
            }, 
            include: [{
                model: Ticket,
                attributes: ['user_id', 'staff_id'],
                required: true
            }],
            order: [['sentAt', 'ASC']]
        });

        const participants = await User.findAll({
            where: {
                [Op.or]: [
                    {id: messages.Ticket.user_id},
                    {staff_id: messages.Ticket.staff_id}
                ]
            }
        })

        let user = ""
        let staff = ""

        for (let i = 0; i < messages.length; i++) {
            if (messages[i].sender_id == user.id) {
                messages[i].sender_username = user.username;
                messages[i].isSender = true
            } else {
                messages[i].sender_username = user.username;
                messages[i].isSender = false
            }
        };

        return res.status(200).json(messages)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};  
 
export const getConversationHistory = async (req, res) => {
    const ticket_id = req.params.id
    const user = req.user;
    const staff = req.staff;
    const sortBy = req.query.sortBy // newest/oldest
    try {
        const conversation = await Conversation.findAll({
            include: [{
                model: Ticket,
                attributes: ['user_id', 'staff_id'],
                required: true
            }],
            where: {
                ticket_id: ticket_id,
                [Op.or]: [
                    ...(user ? [{'$Ticket.user_id$': user.id}] : []), // if user is request sender, ticket must belong to user
                    ...(staff ? [{'$Ticket.staff_id$': staff.staff_id}] : []) // if staff is request sender, ticket must belong to staff
                ]
            },
            attributes: ['id', 'createdAt', 'endedAt'],
            order: [['createdAt', sortBy?.toLowerCase() === 'newest' ? 'DESC' : 'ASC']]
        });

        return res.status(200).json(conversation);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

// post
export const sendMessage = async (req, res) => {

    const conversation_id = req.query.id
    const user = req.user
    const content = req.body.content
    try {

        // send message
        const message = await Message.create({
            conversation_id: conversation_id,
            sender_id: user.id,
            content: content,
            sentAt: new Date(Date.now())
        })

        return res.status(200).json({message: "message successfully sent"})
    }catch (error) {
        return res.status(500).json({message: error.message})
    }
};