import sequelize from '../config/sequelize.js';
import { Model, DataTypes } from 'sequelize';
class User extends Model {

}

// tell sequelize to initialize the table
User.init(
    {
        username: {
            type: DataTypes.STRING(18),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        role_code: {
            type: DataTypes.CHAR(3),
            allowNull: false,
            references: {
                model: "Roles",
                key: "role_code"
            }
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: false 
        }
    },
    {
        sequelize,
        modelName: "User",
        tableName: "Users"
    }
);

export default User;