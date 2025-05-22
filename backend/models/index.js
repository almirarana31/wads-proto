import Staff from './Staff.js';
import User from './User.js';
import Role from './enum/Role.js';
import Job from './enum/Job.js';
import Category from "./enum/Category.js";
import Status from "./enum/Status.js";
import Priority from "./enum/Priority.js";
import Ticket from "./Ticket.js";

// Staff
Staff.belongsTo(Role, {foreignKey: 'role_id'})
Staff.belongsTo(Category, {foreignKey: 'field_id'})
Staff.belongsTo(Job, {foreignKey: 'job_id'})

// User
User.belongsTo(Staff, {foreignKey: 'staff_id'})
// Ticket 
Ticket.belongsTo(User, {foreignKey: 'user_id', as: 'User'})
Ticket.belongsTo(Staff, {foreignKey: 'staff_id', as: 'Staff'})
Ticket.belongsTo(Category, {foreignKey: 'category_id'})
Ticket.belongsTo(Priority, {foreignKey: 'priority_id'})
Ticket.belongsTo(Status, {foreignKey: 'status_id'})

export {
    Staff,
    User,
    Ticket,
    Category,
    Status,
    Priority,
    Role,
    Job
};
