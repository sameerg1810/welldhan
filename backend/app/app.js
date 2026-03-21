import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './core/db.js';

// Import routers
import authRouter from './routes/v1/auth.js';
import twofaRouter from './routes/v1/twofa.js';
import householdsRouter from './routes/households.js';
import bookingsRouter from './routes/bookings.js';
import slotsRouter from './routes/slots.js';
import communityRouter from './routes/community.js';
import dashboardRouter from './routes/dashboard.js';
import foodRouter from './routes/food.js';
import notificationsRouter from './routes/notifications.js';
import packagesRouter from './routes/packages.js';
import paymentsRouter from './routes/payments.js';
import trainersRouter from './routes/trainers.js';

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Connect to DB (don't block for tests)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'WELLDHAN API (Node.js/Express)' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API Routes
const routers = [
    { path: '/api/v1/auth', router: authRouter },
    { path: '/api/v1', router: twofaRouter },
    { path: '/api/v1', router: householdsRouter },
    { path: '/api/v1', router: bookingsRouter },
    { path: '/api/v1', router: slotsRouter },
    { path: '/api/v1', router: communityRouter },
    { path: '/api/v1', router: dashboardRouter },
    { path: '/api/v1', router: foodRouter },
    { path: '/api/v1', router: notificationsRouter },
    { path: '/api/v1', router: packagesRouter },
    { path: '/api/v1', router: paymentsRouter },
    { path: '/api/v1', router: trainersRouter },
    
    // Compatibility routers (existing frontend uses /api/*)
    { path: '/api/auth', router: authRouter },
    { path: '/api', router: twofaRouter },
    { path: '/api', router: householdsRouter },
    { path: '/api', router: bookingsRouter },
    { path: '/api', router: slotsRouter },
    { path: '/api', router: communityRouter },
    { path: '/api', router: dashboardRouter },
    { path: '/api', router: foodRouter },
    { path: '/api', router: notificationsRouter },
    { path: '/api', router: packagesRouter },
    { path: '/api', router: paymentsRouter },
    { path: '/api', router: trainersRouter },
];

routers.forEach(r => {
    app.use(r.path, r.router);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Internal Server Error', 
        detail: err.message, // For compatibility with frontend expecting detail
        error: err.message 
    });
});

export default app;
