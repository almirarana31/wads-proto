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
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };

dotenv.config();

await sequelize.sync();

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Enable CORS for all routes
const corsOptions = {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'https://e2425-wads-l4ccg3-client.csbihub.id',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role', 'Origin', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.options('*', cors(corsOptions));

// Add better error handling for CORS and other issues
app.use((err, req, res, next) => {
    if (err.name === 'CORSError') {
        res.status(403).json({
            error: 'CORS error',
            message: err.message,
            origin: req.headers.origin
        });
    } else {
        next(err);
    }
});
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        console.log('Received OPTIONS request for:', req.path);
        // Let the CORS middleware handle it
    }
    next();
});

app.use(express.json());

// Add header validation middleware
app.use((req, res, next) => {
    // Log request details for debugging
    console.log('Request URL:', req.url);
    console.log('Request Headers:', req.headers);
    console.log('Request Method:', req.method);
    
    next();
});

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

app.get('/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
  res.status(200).json({ status: 'ok' });
});

app.listen(process.env.PORT, () => {
        console.log(`Connected to the backend at port ${process.env.BASE_URL}`);
        console.log(`API documentation available at ${process.env.BASE_URL}/api-docs`);
});
