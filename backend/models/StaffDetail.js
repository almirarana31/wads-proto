import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class StaffDetail extends Model {

}

// tell sequelize to initialize the table
StaffDetail.init(
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
        allowNull: false,
        references: {
            model: 'category',
            key: 'id'
        }
       },
       role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'role',
            key: 'id'
        }
       }
    },
    {
        sequelize,
        modelName: "StaffDetail",
        tableName: "staffDetail"
    }
);

export default StaffDetail;