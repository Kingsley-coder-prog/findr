const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./modules/auth/auth.routes");
const searchRoutes = require("./modules/search/search.routes");
const placesRoutes = require("./modules/places/places.routes");
const agentRoutes = require("./modules/agent/agent.routes");
const errorHandler = require("./middleware/errorHandler");

require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "https://findr-self.vercel.app",
  /https:\/\/findr-.*\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin,
      );
      if (allowed) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/agent", agentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    project: "Findr",
    timestamp: new Date().toISOString(),
  });
});

// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
