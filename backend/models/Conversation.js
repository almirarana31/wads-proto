import sequelize from "../config/sequelize.js";
import {Model, DataTypes} from 'sequelize';

class Conversation extends Model {

}

Conversation.init(
    {
        ticket_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'ticket',
                key: 'id'
            }
        },
        endedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        closed: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Conversation',
        tableName: 'conversation'
    }
);

export default Conversation