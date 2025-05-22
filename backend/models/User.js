import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
import StaffDetail from './Staff.js';
class User extends Model {

}

// tell sequelize to initialize the table
User.init(
    {
       staff_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'staff',
            key: 'id'
        }
       },
       username: {
        type: DataTypes.STRING,
        allowNull: false
       },
       password: {
        type: DataTypes.STRING,
        allowNull: false
       },
       email: {
        type: DataTypes.STRING,
        allowNull: false
       },
       last_login: {
        type: DataTypes.DATE,
        allowNull: true
       }
    },
    {
        sequelize,
        modelName: "User",
        tableName: "user",
        timestamps: false
    }
);

export default User;