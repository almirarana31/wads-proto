import sequelize from '../config/sequelize.js';
import { Model, DataTypes} from 'sequelize';
class Job extends Model {

}

// tell sequelize to initialize the table
Job.init(
    {
       name: {
        type: DataTypes.STRING,
        allowNull: false
       }
    },
    {
        sequelize,
        modelName: "Job",
        tableName: "job",
        timestamps: false
    }
);

export default Job;