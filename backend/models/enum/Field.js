import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Field extends Model {

}

// tell sequelize to initialize the table
Field.init(
    {
       name: {
        type: DataTypes.STRING,
        allowNull: false
       }
    },
    {
        sequelize,
        modelName: "Field",
        tableName: "field",
        timestamps: false
    }
);

export default Field;