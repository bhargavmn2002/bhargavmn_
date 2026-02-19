require('dotenv').config();

// Set timezone to India (IST)
process.env.TZ = process.env.TIMEZONE || 'Asia/Kolkata';

const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const displayRoutes = require('./routes/display.routes');
const playerRoutes = require('./routes/player.routes');
const mediaRoutes = require('./routes/media.routes');
const playlistRoutes = require('./routes/playlist.routes');
const layoutRoutes = require('./routes/layout.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const proofOfPlayRoutes = require('./routes/proofOfPlay.routes');
const monitoringRoutes = require('./routes/monitoring.routes');

// Services
const cleanupService = require('./services/cleanup.service');
const backupService = require('./services/backup.service');
const healthService = require('./services/health.service');
const cacheService = require('./services/cache.service');
const imageOptimizationService = require('./services/image-optimization.service');
const databaseOptimizationService = require('./services/database-optimization.service');

// Middleware
const { logAuthEvents, logSensitiveAccess, logSuspiciousActivity } = require('./middleware/logging.middleware');
const { globalErrorHandler } = require('./middleware/error.middleware');
const {
  requestLogger,
  performanceMonitor,
  memoryMonitor,
  rateLimitMonitor,
  apiAnalytics,
  securityMonitor,
  healthCheck
} = require('./middleware/monitoring.middleware');
const { auditRequest, auditAuth } = require('./middleware/audit.middleware');

const app = express();

/* =========================
   SECURITY & PERFORMANCE
========================= */

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      mediaSrc: ["'self'", 'blob:', '*'],
      connectSrc: [
        "'self'",
        ...(process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['*'])
      ],
    },
  },
}));

app.use(compression());

/* =========================
   RATE LIMITING
========================= */

let limiter, authLimiter;

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

    authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 30,
    skipSuccessfulRequests: true,
  });

  app.use(limiter);
  
  console.log('✅ Rate limiting enabled (production mode)');
} else {
  // No-op middleware for development
  limiter = (req, res, next) => next();
  authLimiter = (req, res, next) => next();
  
  console.log('⚠️  Rate limiting disabled (development mode)');
}

/* =========================
   CORS (RENDER SAFE)
========================= */

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, check allowed origins
    const allowed = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [];
    
    // Check if origin matches any allowed origin
    const isAllowed = allowed.some(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) return true;
      // Wildcard match (e.g., *.onrender.com)
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }
    
    console.error(`❌ CORS blocked origin: ${origin}`);
    console.error(`   Allowed origins: ${allowed.join(', ')}`);
    return callback(new Error('CORS blocked'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

/* =========================
   BODY & LOGGING
========================= */

app.use(express.json({ limit: '50mb' }));

app.use(requestLogger);
app.use(performanceMonitor);
app.use(memoryMonitor);
app.use(rateLimitMonitor);
app.use(apiAnalytics);
app.use(securityMonitor);
app.use(healthCheck);

app.use(logAuthEvents);
app.use(logSuspiciousActivity);
app.use(auditRequest);

/* =========================
   STATIC UPLOADS (RENDER DISK)
========================= */

app.use('/uploads', express.static('public/uploads', {
  setHeaders: (res, filePath) => {
    const map = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.m3u8': 'application/vnd.apple.mpegurl',
      '.ts': 'video/MP2T',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    for (const ext in map) {
      if (filePath.endsWith(ext)) {
        res.setHeader('Content-Type', map[ext]);
      }
    }

    res.setHeader('Accept-Ranges', 'bytes');
  },
}));

/* =========================
   ROUTES
========================= */

app.use('/api/auth', authLimiter, auditAuth, authRoutes);
app.use('/api/users', logSensitiveAccess, userRoutes);
app.use('/api/displays', displayRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/schedules', require('./routes/schedule.routes'));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', logSensitiveAccess, adminRoutes);
app.use('/api/proof-of-play', proofOfPlayRoutes);
app.use('/api/monitoring', monitoringRoutes);

/* =========================
   HEALTH & ROOT
========================= */

app.get('/', (req, res) => {
  res.send('SignoX Backend Running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SignoX Backend',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use(globalErrorHandler);

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
const HOST = '0.0.0.0';
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';

let server;

if (ENABLE_HTTPS) {
  // HTTPS Server with SSL/TLS
  try {
    const sslOptions = {
      key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH)),
      cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH)),
    };

    server = https.createServer(sslOptions, app);
    
    server.listen(HTTPS_PORT, HOST, () => {
      console.log(`🔒 SignoX Backend running on HTTPS at ${HOST}:${HTTPS_PORT}`);
      console.log(`🔐 SSL/TLS enabled - Secure connection established`);
      
      if (process.env.NODE_ENV === 'production') {
        cleanupService.start();
        healthService.start();
        databaseOptimizationService.optimizeConnectionPool();
        console.log('✅ Production services started');
      }
    });

    // Optional: Redirect HTTP to HTTPS
    const httpApp = express();
    httpApp.use((req, res) => {
      res.redirect(301, `https://${req.headers.host.replace(PORT, HTTPS_PORT)}${req.url}`);
    });
    
    http.createServer(httpApp).listen(PORT, HOST, () => {
      console.log(`↪️  HTTP redirect server running on ${HOST}:${PORT} -> HTTPS:${HTTPS_PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error.message);
    console.error('   Please check SSL certificate paths in .env file');
    console.error(`   SSL_CERT_PATH: ${process.env.SSL_CERT_PATH}`);
    console.error(`   SSL_KEY_PATH: ${process.env.SSL_KEY_PATH}`);
    process.exit(1);
  }
} else {
  // HTTP Server (for development or when behind load balancer)
  server = http.createServer(app);
  
  server.listen(PORT, HOST, () => {
    console.log(`🚀 SignoX Backend running on HTTP at ${HOST}:${PORT}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Running in HTTP mode - Ensure SSL termination is handled by load balancer');
    }

    if (process.env.NODE_ENV === 'production') {
      cleanupService.start();
      healthService.start();
      databaseOptimizationService.optimizeConnectionPool();
      console.log('✅ Production services started');
    }
  });
}

/* =========================
   GRACEFUL SHUTDOWN
========================= */

const shutdown = () => {
  console.log('🛑 Shutting down...');
  cleanupService.stop();
  healthService.stop();
  cacheService.disconnect();
  databaseOptimizationService.disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
