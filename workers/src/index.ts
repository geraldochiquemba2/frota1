import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth";
import { vehicleRoutes } from "./routes/vehicles";
import { driverRoutes } from "./routes/drivers";
import { tripRoutes } from "./routes/trips";
import { maintenanceRoutes } from "./routes/maintenance";
import { alertRoutes } from "./routes/alerts";
import { metricsRoutes } from "./routes/metrics";
import { driverAppRoutes } from "./routes/driver-app";
import { supplierRoutes } from "./routes/suppliers";
import { fuelRoutes } from "./routes/fuel";
import type { JWTPayload } from "./lib/jwt";

export type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ENVIRONMENT: string;
};

export type Variables = {
  user: JWTPayload;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};

const app = new Hono<AppEnv>();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      // When serving frontend from same domain, CORS is not needed
      // But keep for development and any cross-origin requests
      const allowedOrigins = [
        "https://frota.20230043.workers.dev",
      ];
      
      if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".workers.dev"))) {
        return origin;
      }
      // For development
      if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("replit"))) {
        return origin;
      }
      return origin || "";
    },
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/health", (c) => {
  return c.json({ status: "healthy" });
});

app.get("/api", (c) => {
  return c.json({ 
    message: "FleetTrack API - Cloudflare Workers",
    version: "1.0.0",
    status: "running"
  });
});

app.route("/api/auth", authRoutes);
app.route("/api/vehicles", vehicleRoutes);
app.route("/api/drivers", driverRoutes);
app.route("/api/trips", tripRoutes);
app.route("/api/maintenance", maintenanceRoutes);
app.route("/api/alerts", alertRoutes);
app.route("/api/metrics", metricsRoutes);
app.route("/api/driver", driverAppRoutes);
app.route("/api/suppliers", supplierRoutes);
app.route("/api/fuel", fuelRoutes);

app.notFound((c) => {
  return c.json({ error: "Endpoint não encontrado" }, 404);
});

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ error: "Erro interno do servidor" }, 500);
});

export default app;
