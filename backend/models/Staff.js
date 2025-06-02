import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Staff extends Model {

}

// tell sequelize to initialize the table
Staff.init(
    {
       email: {
        type: DataTypes.STRING,
        allowNull: false
       },
       role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'role',
            key: 'id'
        }
       },
       field_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'category',
            key: 'id'
        }
       },
       job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'job',
            key: 'id'
        }
       }
    },
    {
        sequelize,
        modelName: "Staff",
        tableName: "staff"
    }
);

export default Staff;