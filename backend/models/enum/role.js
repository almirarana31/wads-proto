import sequelize from '../../config/sequelize.js';
import { Model, DataTypes } from 'sequelize';

class Role extends Model {

}

Role.init(
    {
        role_code: {
            type: DataTypes.CHAR(3),
            allowNull: false,
            primaryKey: true
        },
        role_desc: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: "Role",
        tableName: "Roles",
        timestamps: false
    }
);

export default Role