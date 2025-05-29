import sequelize from '../../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Role extends Model {

}

// tell sequelize to initialize the table
Role.init(
    {
       name: {
        type: DataTypes.STRING,
        allowNull: false
       },
       description: {
        type: DataTypes.STRING,
        allowNull: false
       }
    },
    {
        sequelize,
        modelName: "Role",
        tableName: "role",
        timestamps: false
    }
);

export default Role;