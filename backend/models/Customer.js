import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Customer extends Model {

}

// tell sequelize to initialize the table
Customer.init(
    {
       username: {
        type: DataTypes.STRING,
        allowNull: false
       },
       password: {
        type: DataTypes.STRING,
        allowNull: false
       },
       email: {
        type: DataTypes.STRING,
        allowNull: false
       },
       last_login: {
        type: DataTypes.DATE,
        allowNull: true
       }
    },
    {
        sequelize,
        modelName: "Customer",
        tableName: "customer"
    }
);

export default Customer;