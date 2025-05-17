import dotenv from 'dotenv';
import express from 'express';
import sequelize from './config/sequelize.js';
import userRoutes from './routes/user_routes.js'
import { User, Ticket, Role, Category, Priority, Status } from './models/index.js'
// import { addFK } from './queries.js';

dotenv.config();

await sequelize.sync();

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
    res.send("Hello from the backend!")
});

app.listen(process.env.PORT, () => {
        console.log(`Connected to the backend at port ${process.env.PORT}`)
});