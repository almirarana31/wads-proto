import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
import User from './User.js';
class Audit extends Model {
    
}

Audit.init(
    {
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            }
        },
        detail: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },{
        sequelize,
        timestamps: false,
        modelName: "Audit",
        tableName: "audit"
    }
)

export default Audit;