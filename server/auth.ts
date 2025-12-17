import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { AdminUser } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userType?: "admin" | "driver";
  }
}

export function setupAuth(app: Express): void {
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: databaseUrl,
    createTableIfMissing: true,
    tableName: "sessions",
  });

  // For cross-origin (Cloudflare Workers/Pages), we need sameSite: "none" and secure: true
  const isProduction = process.env.NODE_ENV === "production";
  
  app.set("trust proxy", 1); // Trust first proxy (Cloudflare)
  
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "fleettrack-secret-key-2024",
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        secure: isProduction, // Must be true for sameSite: "none"
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production
      },
    })
  );

  // Ensure admin user exists on startup
  storage.ensureAdminExists().catch(console.error);

  // Register route (creates a driver)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { phone, password, name } = req.body;

      if (!phone || !password || !name) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      // Check if driver already exists
      const existingDriver = await storage.getDriverByPhone(phone);
      if (existingDriver) {
        return res.status(400).json({ error: "Este número já está cadastrado" });
      }

      // Create new driver
      const newDriver = await storage.createDriver({
        phone,
        password,
        name,
        status: "available",
      });

      req.session.userId = newDriver.id;
      req.session.userType = "driver";

      res.json({
        id: newDriver.id,
        phone: newDriver.phone,
        name: newDriver.name,
        type: "driver",
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Login route (checks admin first, then driver)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ error: "Número e senha são obrigatórios" });
      }

      // Try admin login first
      const adminUser = await storage.getAdminUserByPhone(phone);
      if (adminUser && adminUser.password === password) {
        req.session.userId = adminUser.id;
        req.session.userType = "admin";
        return res.json({
          id: adminUser.id,
          phone: adminUser.phone,
          name: adminUser.name,
          type: "admin",
        });
      }

      // Try driver login
      const driver = await storage.getDriverByPhone(phone);
      if (driver && driver.password === password) {
        req.session.userId = driver.id;
        req.session.userType = "driver";
        return res.json({
          id: driver.id,
          phone: driver.phone,
          name: driver.name,
          type: "driver",
        });
      }

      return res.status(401).json({ error: "Credenciais inválidas" });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao fazer logout" });
      }
      res.json({ success: true });
    });
  });

  // Get current user route
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const userType = req.session.userType || "admin";

      if (userType === "driver") {
        const driver = await storage.getDriver(req.session.userId);
        if (!driver) {
          req.session.destroy(() => {});
          return res.status(401).json({ error: "Usuário não encontrado" });
        }
        return res.json({
          id: driver.id,
          phone: driver.phone,
          name: driver.name,
          type: "driver",
        });
      }

      const user = await storage.getAdminUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      res.json({
        id: user.id,
        phone: user.phone,
        name: user.name,
        type: "admin",
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });
}
