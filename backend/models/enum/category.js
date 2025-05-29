import sequelize from '../../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Category extends Model {

}

// tell sequelize to initialize the table
Category.init(
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
        modelName: "Category",
        tableName: "category",
        timestamps: false
    }
);

export default Category;