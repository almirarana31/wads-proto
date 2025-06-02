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
    origin: true, // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-User-Role',
        'Origin',
        'X-Requested-With',
        'Accept',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Credentials'
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests explicitly
app.use((req, res, next) => {
    // Always set these CORS headers for all requests
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, Origin, X-Requested-With, Accept, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request:', {
            path: req.path,
            origin: req.headers.origin,
            method: req.method,
            headers: req.headers
        });
        return res.status(204).end();
    }
    next();
});

// Add better error handling for CORS and other issues
app.use((err, req, res, next) => {
    console.error('Error handling request:', {
        path: req.path,
        method: req.method,
        origin: req.headers.origin,
        error: err.message
    });

    if (err.name === 'CORSError') {
        res.status(403).json({
            error: 'CORS error',
            message: err.message,
            origin: req.headers.origin,
            allowedOrigins: [
                process.env.FRONTEND_URL,
                process.env.CORS_ORIGIN,
                'https://e2425-wads-l4ccg3-client.csbihub.id'
            ].filter(Boolean)
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

// Add fallback middleware for unhandled routes
app.use((req, res) => {
    console.warn('Unhandled request:', {
        path: req.path,
        method: req.method,
        origin: req.headers.origin
    });
    
    // Ensure CORS headers are set even for 404 responses
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.path} not found`
    });
});

// Final error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Ensure CORS headers are set even for error responses
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

app.listen(process.env.PORT, () => {
        console.log(`Connected to the backend at port ${process.env.BASE_URL}`);
        console.log(`API documentation available at ${process.env.BASE_URL}/api-docs`);
});
