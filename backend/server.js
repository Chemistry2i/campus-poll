// backend/server.js

// Loading environment variables
require('dotenv').config();

// Initialize Datadog Tracing as the very first thing (agentless for Render)
const tracer = require('dd-trace').init({
  apiKey: process.env.DD_API_KEY,
  site: process.env.DD_SITE || 'datadoghq.com',
});
console.log(
  `🟣 Datadog tracing enabled (agentless). Service: ${process.env.DD_SERVICE}, Env: ${process.env.DD_ENV}, Site: ${process.env.DD_SITE || 'datadoghq.com'}`
);

// Core Modules
const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const colors = require("colors");
const mongoSanitize = require('express-mongo-sanitize');
const cron = require('node-cron');

// Config files
const dbConfig = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const candidateMaterialRoutes = require('./routes/candidateMaterialRoutes');
const electionRoutes = require("./routes/electionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const voteRoutes = require("./routes/voteRoutes");
const logRoutes = require("./routes/logRoutes");
const adminRoutes = require('./routes/adminRoutes');
const devRoutes = require('./routes/devRoutes');
const reportRoutes = require('./routes/reportRoutes');
const metaRoutes = require('./routes/metaRoutes');
const contactRoutes = require('./routes/contactRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const agentRoutes = require('./routes/agentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const observerRoutes = require('./routes/observerRoutes');
const backupController = require('./controllers/backupController');

// Create Express App
const app = express();

// Constants
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// -------------------- MIDDLEWARE --------------------

// CORS (must be first)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://api.campusballot.tech",
    "https://localhost:5173",
    "https://localhost:5000"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Custom NoSQL sanitizer (safe, no 500 errors)
app.use((req, res, next) => {
  // Skip for multipart/form-data (file uploads)
  if (req.is('multipart/form-data')) return next();

  // Sanitize req.body if it exists
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize req.params if it exists
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
});

// Helper function to sanitize objects (removes $ and . keys)
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
    if (key.includes('$') || key.includes('.')) {
      delete obj[key];
    }
  }
}

app.use(helmet());

// Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "http://localhost:5173", "https://api.campusballot.tech"],
      scriptSrc: [
        "'self'",
        "http://localhost:5173",
        "https://api.campusballot.tech",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'",
        "http://localhost:5173",
        "https://api.campusballot.tech",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'unsafe-inline'"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "http://localhost:5173",
        "https://api.campusballot.tech"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:5173",
        "https://api.campusballot.tech"
      ],
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "http://localhost:5173",
        "https://api.campusballot.tech"
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(morgan("dev"));

// -------------------- RESPONSE TIME TRACKING --------------------
if (!global.__apiResponseTimes) global.__apiResponseTimes = [];

app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const ms = diff[0] * 1000 + diff[1] / 1e6;

    if (req.originalUrl.startsWith('/api/')) {
      global.__apiResponseTimes.push(ms);
      if (global.__apiResponseTimes.length > 100) {
        global.__apiResponseTimes.shift();
      }
    }
  });
  next();
});

// -------------------- RATE LIMITING --------------------
const { ipKeyGenerator } = require("express-rate-limit");

const customRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req) => {
    let limit = 100;
    try {
      const user = req.user || (req.session && req.session.user);
      if (user && ["admin", "super admin", "observer"].includes(user.role)) {
        limit = 1000;
      }
    } catch {}
    return limit;
  },
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) return req.user.id;
    return ipKeyGenerator(req, res);
  },
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(customRateLimiter);

// -------------------- STATIC --------------------
app.use(express.static("public"));

// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
  res.send("Welcome to the University Voting System API");
});

app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use('/api/candidates/agents', agentRoutes);
app.use('/api/candidate/engagement', engagementRoutes);
app.use('/api/candidate', candidateMaterialRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/logs", logRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/observer', observerRoutes);
app.use('/api/user', require('./routes/roleManagement'));

// -------------------- SOCKET.IO --------------------
const http = require('http');
const { Server: IOServer } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      CORS_ORIGIN
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake?.auth?.token ||
      (socket.handshake?.headers?.authorization
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) return next(new Error('Authentication error'));

    socket.user = user;
    next();
  } catch (err) {
    console.log('Socket auth error:', err.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(
    'Socket connected:',
    socket.id,
    'user:',
    socket.user ? socket.user.email : 'anonymous'
  );

  socket.on('join', (room) => {
    if (!room) return;

    if (
      (room.startsWith('election_') || room.startsWith('admin_')) &&
      (!socket.user || socket.user.role !== 'admin')
    ) {
      socket.emit('error', 'Not authorized to join this room');
      return;
    }

    socket.join(room);
  });

  socket.on('leave', (room) => {
    if (room) socket.leave(room);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

app.set('io', io);

// -------------------- START SERVER --------------------
server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`.blue);
  console.log(`🔓 CORS enabled for: ${CORS_ORIGIN}`.cyan);

  try {
    await dbConfig();
    console.log("✅ Database connected successfully".green);
  } catch (error) {
    console.error("❌ Database connection failed".red, error);
    process.exit(1);
  }

  try {
    scheduleBackups(app);
  } catch (err) {
    console.error('Failed to schedule backups:', err.message);
  }
});

// -------------------- BACKUPS --------------------
function scheduleBackups(app) {
  const existing = app.get('backupTask');
  if (existing) existing.stop();

  const setup = async () => {
    const cfg = await backupController.getScheduleConfig();
    if (!cfg.enabled) {
      console.log('📦 Backups: schedule disabled');
      app.set('backupTask', null);
      return;
    }

    const [hh, mm] = (cfg.time || '02:00').split(':');
    const hour = Number(hh) || 2;
    const minute = Number(mm) || 0;
    const cronExpr = buildCron(cfg.frequency, minute, hour);

    const task = cron.schedule(cronExpr, async () => {
      try {
        const result = await backupController.performBackup({
          app,
          type: 'scheduled'
        });
        console.log(`📦 Scheduled backup created at ${result.timestamp}`);
      } catch (e) {
        console.error('Scheduled backup failed:', e.message);
      }
    }, { timezone: 'UTC' });

    app.set('backupTask', task);
    console.log(`📦 Backups scheduled: ${cfg.frequency} at ${cfg.time} (cron: ${cronExpr})`);
  };

  setup();
  app.set('scheduleBackups', () => scheduleBackups(app));
}

function buildCron(freq, minute, hour) {
  const m = Math.max(0, Math.min(59, minute));
  const h = Math.max(0, Math.min(23, hour));
  if (freq === 'weekly') return `0 ${m} ${h} * * 0`;
  if (freq === 'monthly') return `0 ${m} ${h} 1 * *`;
  return `0 ${m} ${h} * * *`;
}

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Server error'
  });
});
