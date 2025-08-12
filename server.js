const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cors = require("cors");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
console.log('🚀 Starting EngineerSmith server...');

// Allow your Vite dev server and production domain
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://engineersmith.com"
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true, // allow cookies
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 1000,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// MongoDB connection
const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Import routes
const authRoutes = require('./app/routes/auth');
const userRoutes = require('./app/routes/users');
const questionRoutes = require('./app/routes/questions');
const adminRoutes = require('./app/routes/admin');
const testRoutes = require('./app/routes/tests');
const { authenticateToken } = require('./app/middleware/auth');

// Bootstrap admin user (only works if no admin exists)
app.post('/api/bootstrap-admin', async (req, res) => {
    try {
        const { email, password, firstName, lastName, bootstrapSecret } = req.body;

        // Check bootstrap secret
        if (bootstrapSecret !== process.env.BOOTSTRAP_SECRET && bootstrapSecret !== 'bootstrap123') {
            return res.status(403).json({ error: 'Invalid bootstrap secret' });
        }

        const User = require('./app/models/User');

        // Check if any admin user already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(409).json({ error: 'Admin user already exists. Use normal user creation instead.' });
        }

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'All fields required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Create first admin user
        const admin = new User({
            email,
            password,
            role: 'admin',
            profile: { firstName, lastName }
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Bootstrap admin user created successfully',
            user: {
                id: admin._id,
                email: admin.email,
                role: admin.role,
                profile: admin.profile
            }
        });

    } catch (error) {
        console.error('Bootstrap admin error:', error);
        res.status(500).json({ error: 'Failed to create bootstrap admin' });
    }
});

// Health check route (public)
app.get('/health', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
        const memoryUsage = process.memoryUsage();

        res.json({
            status: 'OK',
            message: 'EngineerSmith server is running',
            timestamp: new Date().toISOString(),
            mongodb: dbStatus,
            uptime: Math.floor(process.uptime()),
            memory: {
                used: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
                heap: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
            },
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);

// Test protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Authentication working!',
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method,
        availableEndpoints: [
            'GET /health - Server health check',
            'POST /api/auth/login - User login',
            'POST /api/auth/register - User registration',
            'GET /api/auth/me - Current user info',
            'GET /api/questions - List questions',
            'POST /api/questions - Create question',
            'GET /api/tests - List tests',          // NEW
            'POST /api/tests - Create test',        // NEW
            'GET /api/admin/dashboard - Admin dashboard',
            'GET /api/protected - Test authentication'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
const startServer = async () => {
    try {
        await connectToMongo();

        const PORT = process.env.PORT || 7000;
        const server = app.listen(PORT, () => {
            console.log(`🚀 EngineerSmith server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/*`);
            console.log(`❓ Questions: http://localhost:${PORT}/api/questions`);
            console.log(`👑 Admin: http://localhost:${PORT}/api/admin/*`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`\n🔄 Received ${signal}. Closing server gracefully...`);
            server.close(async () => {
                try {
                    await mongoose.connection.close();
                    console.log('✅ Server and MongoDB connection closed');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error closing MongoDB connection:', error);
                    process.exit(1);
                }
            });
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (error) {
        console.error('❌ Server startup error:', error.message);
        process.exit(1);
    }
};

startServer();