import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Staff extends Model {

}

// tell sequelize to initialize the table
Staff.init(
    {
       username: {
        type: DataTypes.STRING,
        allowNull: false
       },
       password: {
        type: DataTypes.STRING,
        allowNull: false
       },
       detail_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'staffDetail',
            key: 'id'
        }
       },
       email: {
        type: DataTypes.STRING,
        allowNull: false
       },
       last_login: {
        DataTypes: DataTypes.DATE
       }
    },
    {
        sequelize,
        modelName: "Staff",
        tableName: "staff"
    }
);

export default Staff;