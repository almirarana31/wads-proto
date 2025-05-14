import sequelize from "../../config/sequelize.js";
import { Model, DataTypes } from 'sequelize'

class Status extends Model {};

Status.init({
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
    modelName: "Status",
    tableName: "Statuses"
}
)

export default Status