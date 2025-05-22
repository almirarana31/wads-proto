import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class User extends Model {

}

// tell sequelize to initialize the table
User.init(
    {
       customer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'customer',
            key: 'id'
        }
       },
       staff_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'staff',
            key: 'id'
        }
       }
    },
    {
        sequelize,
        modelName: "User",
        tableName: "User",
        timestamps: false
    }
);

User.beforeSave((user, options) => {
if (user.staff_id && user.customer_id) {
    throw new Error('User cannot belong to both Staff and Customer');
}
if (!user.staff_id && !user.customer_id) {
    throw new Error('User must belong to either Staff or Customer');
}
});


export default User;