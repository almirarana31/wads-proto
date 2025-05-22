import sequelize from '../../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Priority extends Model {

}

// tell sequelize to initialize the table
Priority.init(
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
        modelName: "Priority",
        tableName: "priority",
        timestamps: false
    }
);

export default Priority;