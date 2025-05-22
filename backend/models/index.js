import Customer from "./Customer.js";
import Staff from './Staff.js';
import User from './User.js';
import StaffDetail from './StaffDetail.js';
import Role from './enum/Role.js';
import Job from './enum/Job.js';
import Category from "./enum/Category.js";
import Status from "./enum/Status.js";
import Priority from "./enum/Priority.js";
import Ticket from "./Ticket.js";

// StaffDetail
StaffDetail.belongsTo(Role, {foreignKey: 'role_id'})
StaffDetail.belongsTo(Category, {foreignKey: 'field_id'})
StaffDetail.belongsTo(Job, {foreignKey: 'job_id'})

// Staff
Staff.belongsTo(StaffDetail, { foreignKey: 'detail_id' });

// User
User.belongsTo(Staff, {foreignKey: 'staff_id'})
User.belongsTo(Customer, {foreignKey: 'customer_id'})

// Ticket 
Ticket.belongsTo(User, {foreignKey: 'user_id', as: 'User'})
Ticket.belongsTo(Staff, {foreignKey: 'staff_id', as: 'Staff'})
Ticket.belongsTo(Category, {foreignKey: 'category_id'})
Ticket.belongsTo(Priority, {foreignKey: 'priority_id'})
Ticket.belongsTo(Status, {foreignKey: 'status_id'})

export {
    Customer,
    Staff,
    User,
    StaffDetail,
    Ticket,
    Category,
    Status,
    Priority,
    Role,
    Job
};
