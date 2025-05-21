import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Status extends Model {

}

// tell sequelize to initialize the table
Status.init(
    {
       name: {
        type: DataTypes.STRING,
        allowNull: false
       },
       description: {
        name: DataTypes.STRING,
        allowNull: false
       }
    },
    {
        sequelize,
        modelName: "Status",
        tableName: "status",
        timestamps: false
    }
);

export default Status;