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
import chatbotRoutes from './routes/chatbot_routes.js';
import { User, Ticket, Role, Category, Priority, Status } from './models/index.js'
import { escalatePriority } from './controllers/ticket.js';
// import { addFK } from './queries.js';
// import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
// import swaggerDocument from './swagger.json' assert { type: 'json' };

dotenv.config();

await sequelize.sync();

const cors = require('cors');

const app = express();

const corsOptions = {
  origin: 'https://e2425-wads-l4ccg3-client.csbihub.id',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

// 1. CORS middleware first
app.use(cors(corsOptions));

// 2. Handle all OPTIONS requests before any other middleware or routes
app.options('*', cors(corsOptions));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

app.use('/api/user', userRoutes);

app.use('/api/staff', staffRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/ticket', ticketRoutes);

app.use('/api/conversation', conversationRoutes);

app.use('/api/audit', auditRoutes);

app.use('/api/chatbot', chatbotRoutes);

// remove once ran ONCE
app.use('/api', defaultQueries);

// // cron job
// cron.schedule("* * */24 * * *", escalatePriority)

app.get('/', (req, res) => {
    res.send("Hello from the backend!")
});

app.listen(process.env.PORT, () => {
        console.log(`Connected to the backend at https://e2425-wads-l4ccg3-server.csbihub.id/api-docs`);
        console.log(`API documentation available at https://e2425-wads-l4ccg3-server.csbihub.id/api-docs`);
});
