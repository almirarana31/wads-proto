import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';

class Message extends Model {

};

Message.init(
    {
        conversation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'conversation',
                key: 'id'
            }
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Message',
        tableName: 'message',
        timestamps: false
    }
);

export default Message;