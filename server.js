// server.js - Fixed MongoDB connection options
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const http = require('http');
const passport = require('passport');
require('dotenv').config();
require('./config/passport'); // Initialize Passport

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://engineersmith.com' : 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true, // Important for cookies
  },
});

// Enhanced security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow for better cookie handling
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS with enhanced cookie support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',       // Vite dev server
      'http://localhost:3000',       // Backup/alternative dev port
      'http://localhost:3001',       // Another common dev port
      'https://engineersmith.com',
      'https://www.engineersmith.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Essential for cookies
  optionsSuccessStatus: 200,
}));

app.use(morgan('dev'));

// Enhanced body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced cookie parser with security options
app.use(cookieParser(process.env.COOKIE_SECRET || 'fallback-secret'));

// Passport initialization
app.use(passport.initialize());

// Trust proxy for production (important for secure cookies behind load balancer)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Rate limiting with different tiers
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: Math.ceil(900000 / 1000 / 60), // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS, 10) || 1000,
  message: {
    error: 'Too many API requests, please try again later.',
    retryAfter: Math.ceil(900000 / 1000 / 60), // minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth/refresh-token', authLimiter);
app.use('/api', apiLimiter);

// Import routes
const superadminRoutes = require('./routes/superadmin');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const questionsRoutes = require('./routes/questions');
const testsRoutes = require('./routes/tests');
const testSessionsRoutes = require('./routes/testSessions');
const resultsRoutes = require('./routes/results');

// Mount routes
app.use('/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/test-sessions', testSessionsRoutes);
app.use('/api/results', resultsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'EngineerSmith API server is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  // Log error details
  console.error(`Error ${err.status || 500}: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const status = err.status || 500;
  const message = status === 500 && !isDevelopment 
    ? 'Internal server error' 
    : err.message;

  res.status(status).json({
    success: false,
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Enhanced Socket.IO with authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.cookie?.match(/accessToken=([^;]+)/)?.[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.organizationId = decoded.organizationId;
    socket.role = decoded.role;
    
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected:`, socket.id);
  
  // Join organization room for targeted messaging
  socket.join(`org_${socket.organizationId}`);
  
  // Handle test session events
  socket.on('join_test_session', (sessionId) => {
    socket.join(`session_${sessionId}`);
    console.log(`User ${socket.userId} joined test session ${sessionId}`);
  });

  socket.on('leave_test_session', (sessionId) => {
    socket.leave(`session_${sessionId}`);
    console.log(`User ${socket.userId} left test session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected:`, socket.id);
  });
});

// MongoDB connection with FIXED options
async function connectDB() {
  try {
    // FIXED: Removed deprecated options and updated to modern format
    const mongoOptions = {
      maxPoolSize: 10, // Replaces maxPoolSize
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // REMOVED: bufferCommands: false, (deprecated)
      // REMOVED: bufferMaxEntries: 0, (deprecated and causing the error)
    };

    await mongoose.connect(process.env.MONGO_URL, mongoOptions);
    console.log('✅ Connected to MongoDB');

    // Handle MongoDB connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

// Start server
connectDB();

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 Health check: http://localhost:${PORT}`);
});