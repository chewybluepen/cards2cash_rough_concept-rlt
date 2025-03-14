import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using scrypt with a random salt.
 * @param password - The password to hash.
 * @returns A hashed password string with the format `<hash>.<salt>`.
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hashBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${hashBuffer.toString("hex")}.${salt}`;
}

/**
 * Compares a supplied password with a stored hashed password.
 * @param supplied - The user-inputted password.
 * @param stored - The stored hashed password.
 * @returns A boolean indicating if the passwords match.
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const storedHashBuffer = Buffer.from(hashed, "hex");
  const suppliedHashBuffer = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(storedHashBuffer, suppliedHashBuffer);
}

/**
 * Configures authentication and session management for the Express app.
 * @param app - The Express application instance.
 */
export function setupAuth(app: Express): void {
  const sessionSecret = process.env.SESSION_SECRET || "fallback-secret"; // ⚠️ Temporary fix

  if (!process.env.SESSION_SECRET) {
    console.warn("⚠️ Warning: SESSION_SECRET is not set. Using a fallback secret. Set this in environment variables.");
  }

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  // Register new users
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json(newUser);
      });
    } catch (error) {
      res.status(500).json({ message: "Error registering user" });
    }
  });

  // Login existing users
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  // Logout users
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user session
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
}
