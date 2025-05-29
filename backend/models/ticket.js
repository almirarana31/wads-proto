import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Ticket extends Model {

}

// tell sequelize to initialize the table
Ticket.init(
    {
       user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
       },
       staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'staff',
            key: 'id'
        }
       }, 
       category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'category',
            key: 'id'
        }
       },
       priority_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'priority',
            key: 'id'
        }
       },
       status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'status',
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
       resolved_at: {
        type: DataTypes.DATE,
        allowNull: true
       }
    },
    {
        sequelize,
        modelName: "Ticket",
        tableName: "ticket"
    }
);

export default Ticket;