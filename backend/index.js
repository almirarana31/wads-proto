import dotenv from 'dotenv';
import express from 'express';
import sequelize from './config/sequelize.js';
import userRoutes from './routes/user_routes.js';
import defaultQueries from './routes/defaultQueries.js';
import adminRoutes from './routes/admin_routes.js';
import ticketRoutes from './routes/ticket_routes.js';
import auditRoutes from './routes/audit_routes.js';
import { User, Ticket, Role, Category, Priority, Status } from './models/index.js'
// import { addFK } from './queries.js';

dotenv.config();

await sequelize.sync();

const app = express();
app.use(express.json());

app.use('/api/user', userRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/ticket', ticketRoutes);

app.use('/api/audit', auditRoutes);

// remove once ran ONCE
app.use('/api', defaultQueries);

app.get('/', (req, res) => {
    res.send("Hello from the backend!")
});

app.listen(process.env.PORT, () => {
        console.log(`Connected to the backend at port ${process.env.PORT}`)
});