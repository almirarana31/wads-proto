import dotenv from 'dotenv';
import express from 'express';
import cron from "node-cron";
import sequelize from './config/sequelize.js';
import userRoutes from './routes/user_routes.js';
import defaultQueries from './routes/defaultQueries.js';
import adminRoutes from './routes/admin_routes.js';
import ticketRoutes from './routes/ticket_routes.js';
import auditRoutes from './routes/audit_routes.js';
import staffRoutes from './routes/staff_routes.js';
import conversationRoutes from './routes/conversation_routes.js';
import { User, Ticket, Role, Category, Priority, Status } from './models/index.js'
import { escalatePriority } from './controllers/ticket.js';
import cors from 'cors';
// import { addFK } from './queries.js';

dotenv.config();

await sequelize.sync();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // or '*' for all origins (not recommended for production)
  credentials: true
}));

app.use(express.json());

app.use('/api/user', userRoutes);

app.use('/api/staff', staffRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/ticket', ticketRoutes);

app.use('/api/conversation', conversationRoutes);

app.use('/api/audit', auditRoutes);

// remove once ran ONCE
app.use('/api', defaultQueries);

// cron job
cron.schedule("* * */24 * * *", escalatePriority)

app.get('/', (req, res) => {
    res.send("Hello from the backend!")
});

app.listen(process.env.PORT, () => {
        console.log(`Connected to the backend at port ${process.env.PORT}`)
});