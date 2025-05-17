import sequelize from "../../config/sequelize.js";
import { Model, DataTypes } from 'sequelize'

class Priority extends Model {};

Priority.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "Priority",
    tableName: "Priorities"
})

export default Priority;