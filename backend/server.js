import express from 'express';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
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
const app = express();

const corsOptions = {
  origin: 'https://e2425-wads-l4ccg3-client.csbihub.id', // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, // Allow cookies, authorization headers
};

// Use CORS middleware BEFORE your routes
app.use(cors(corsOptions));

app.use(express.json());
// app.use('/api', users_router);

app.use('/api/user', userRoutes);

app.use('/api/staff', staffRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/ticket', ticketRoutes);

// PORT, .env variables
const port = process.env.PORT || 30;

app.listen(port, (req, res) => {
    console.log(`Listening on port ${port}`);
});

// setting basic endpoints
app.get('/', (req, res) => {
    console.log(`Connect to server at port ${port}`);
    res.send(`Goodbye World`);
});