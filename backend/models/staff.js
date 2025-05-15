import sequelize from '../config/sequelize.js';
import { Model, DataTypes } from 'sequelize';
class Staff extends Model {

}

// tell sequelize to initialize the table
Staff.init(
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role_code: {
            type: DataTypes.CHAR(3),
            allowNull: false,
            references: {
                model: "Roles",
                key: "role_code"
            }
        }
    },
    {
        sequelize,
        modelName: "Staff",
        tableName: "Staffs",
        timestamps: false
    }
);

export default Staff;