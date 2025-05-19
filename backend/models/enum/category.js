import sequelize from "../../config/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Category extends Model {};

Category.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "Category",
    tableName: "Categories"
});

export default Category;