import dotenv from "dotenv";
dotenv.config(); // Load environment variables at the start

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Constants
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

// Initialize Express
const app = express();

// Global CORS Middleware - must be applied first
app.use(cors({
  origin: "https://cards2cash.netlify.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));

// Explicitly handle OPTIONS (preflight) requests to bypass auth
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "https://cards2cash.netlify.app");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

// Parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// PostgreSQL Session Store
const PGSession = connectPgSimple(session);
app.use(session({
  store: new PGSession({
    conObject: { connectionString: process.env.DATABASE_URL },
  }),
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: ENV === "production", // Secure cookies in production
    httpOnly: true,
    sameSite: "none",
  },
}));

// Request Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  let capturedResponse: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      let logMessage = `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (capturedResponse) logMessage += ` :: ${JSON.stringify(capturedResponse)}`;
      log(logMessage.length > 80 ? logMessage.slice(0, 79) + "…" : logMessage);
    }
  });

  next();
});

// Register API routes (including auth routes)
(async () => {
  const server = await registerRoutes(app);

  // Global Error Handling Middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Ensure error responses include the CORS header
    res.header("Access-Control-Allow-Origin", "https://cards2cash.netlify.app");
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    
    if (ENV !== "production") {
      console.error(err.stack || err);
    }
  });

  // Set up Vite in development, or serve static files in production
  if (ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start Server
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT} in ${ENV} mode`);
  });
})();
