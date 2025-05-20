import User from './user.js';
import Ticket from './ticket.js';
import Role from './enum/role.js';
import Category from './enum/category.js';
import Priority from './enum/priority.js';
import Status from './enum/status.js';
import Staff from './staff.js';



// Ticket model: userID and staffID both refer to User table
Ticket.belongsTo(Category, {foreignKey: 'category'});
Ticket.belongsTo(Status, {foreignKey: 'status'});
Ticket.belongsTo(Priority, {foreignKey: 'priority'});
Ticket.belongsTo(User, { foreignKey: 'userID', as: 'User' });
Ticket.belongsTo(User, { foreignKey: 'staffID', as: 'Staff' });

export {
    User, 
    Role,
    Ticket,
    Category,
    Priority,
    Status,
    Staff
};
