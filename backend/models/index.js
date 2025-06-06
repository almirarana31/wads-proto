import Staff from './Staff.js';
import User from './User.js';
import Role from './enum/Role.js';
import Job from './enum/Job.js';
import Category from "./enum/category.js";
import Status from "./enum/status.js";
import Priority from "./enum/priority.js";
import Ticket from "./Ticket.js";
import Audit from "./Audit.js";
import Conversation from "./Conversation.js";
import Message from "./Message.js";
import Assignment from './Assignment.js';

// Staff
Staff.belongsTo(Role, {foreignKey: 'role_id'})
Staff.belongsTo(Category, {foreignKey: 'field_id'})
Staff.belongsTo(Job, {foreignKey: 'job_id'})

// User
User.belongsTo(Staff, {foreignKey: 'staff_id'})
Staff.hasOne(User, {foreignKey: 'staff_id'});

// Ticket 
Ticket.belongsTo(User, {foreignKey: 'user_id', as: 'User'})
Ticket.belongsTo(Staff, {foreignKey: 'staff_id', as: 'Staff'})
Ticket.belongsTo(Category, {foreignKey: 'category_id'})
Ticket.belongsTo(Priority, {foreignKey: 'priority_id'})
Ticket.belongsTo(Status, {foreignKey: 'status_id'})
Ticket.hasOne(Conversation, {foreignKey: 'ticket_id'})

// Conversation
Message.belongsTo(Conversation, {foreignKey: 'conversation_id'})
Message.belongsTo(User, {foreignKey: 'sender_id'})
Conversation.belongsTo(Ticket, {foreignKey: 'ticket_id'});
Conversation.hasMany(Message, {foreignKey: 'conversation_id'});

// Audit
Audit.belongsTo(User, {foreignKey: 'user_id'});

// Assignment
Assignment.belongsTo(Staff, {foreignKey: 'last_staff'})
Assignment.belongsTo(Category, {foreignKey: 'category_id'})

export {
    Staff,
    User,
    Ticket,
    Conversation,
    Message,
    Category,
    Status,
    Priority,
    Role,
    Job,
    Audit,
    Assignment
};
