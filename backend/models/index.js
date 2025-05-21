import Customer from "./Customer.js";
import Staff from './Staff.js';
import User from './User.js';
import StaffDetail from './StaffDetail.js';
import Role from './enum/Role.js';
import Job from './enum/Job.js';
import Field from './enum/Field.js';
import Category from "./enum/Category.js";
import Status from "./enum/Status.js";
import Priority from "./enum/Priority.js";
import Ticket from "./Ticket.js";

// StaffDetail
StaffDetail.belongsTo(Role, {foreignKey: 'role_id'})
StaffDetail.belongsTo(Field, {foreignKey: 'field_id'})
StaffDetail.belongsTo(Job, {foreignKey: 'job_id'})

// Staff
Staff.belongsTo(StaffDetail, {foreignKey: 'detail_id'})

// User
User.hasOne(Staff, {foreignKey: 'id'})
User.hasOne(User, {foreignKey: 'id'})

// Ticket 
Ticket.belongsTo(User, {foreignKey: 'user_id'})
Ticket.belongsTo(Staff, {foreignKey: 'id'})
Ticket.belongsTo(Category, {foreignKey: 'id'})
Ticket.belongsTo(Priority, {foreignKey: 'id'})
Ticket.belongsTo(Status, {foreignKey: 'id'})

// Ticket model: userID and staffID both refer to User table
Ticket.belongsTo(Category, {foreignKey: 'category'});
Ticket.belongsTo(Status, {foreignKey: 'status'});
Ticket.belongsTo(Priority, {foreignKey: 'priority'});
Ticket.belongsTo(User, { foreignKey: 'userID', as: 'User' });
Ticket.belongsTo(User, { foreignKey: 'staffID', as: 'Staff' });

export {
    Customer,
    Staff,
    StaffDetail,
    Ticket,
    Category,
    Status,
    Priority,
    Role,
    Job,
    Field
};
