import sequelize from "../config/sequelize.js";
import {Model, DataTypes} from 'sequelize';

class Assignment extends Model {

}

Assignment.init(
    {
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'category',
                key: 'id'
            }
        },
        last_staff: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'staff',
                key: 'id'
            }
        }
    }, {
        sequelize,
        timestamps: false,
        modelName: 'Assignment',
        tableName: 'assignment'
    }
)

export default Assignment;