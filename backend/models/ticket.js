import sequelize from "../config/sequelize.js";
import {Model, DataTypes} from 'sequelize'

class Ticket extends Model {};

Ticket.init({
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    categoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Categories',
            key: 'id'
        }
        
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    priority: {
        type: DataTypes.INTEGER, // 1, 2, 3, 4: low, medium, high, urgent
        allowNull: false,
        references: {
            model: 'Priorities',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.INTEGER, // 1, 2, 3, 4, 5: pend, in prog, resolved, closed, cancelled
        allowNull: false,
        references: {
            model: 'Statuses',
            key: 'id'
        }
    },
    resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
    },
    {
        sequelize
    }
);

export default Ticket;