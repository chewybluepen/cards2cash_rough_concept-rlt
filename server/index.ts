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

// CORS Middleware
app.use(cors({
  origin: "https://cards2cash.netlify.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
}));

// Middleware for parsing JSON and URL-encoded data
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
app.use((req, res, next) => {
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

// Initialize Routes
(async () => {
  const server = await registerRoutes(app);

  // Global Error Handling Middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    
    if (ENV !== "production") console.error(err.stack || err);
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
