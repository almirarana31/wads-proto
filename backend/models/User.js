import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class User extends Model {

}

// tell sequelize to initialize the table
User.init(
    {
       customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'customer',
            key: 'id'
        }
       },
       staff_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'customer',
            key: 'id'
        }
       }
    },
    {
        sequelize,
        modelName: "User",
        tableName: "User",
        timestamps: false
    }
);

export default User;