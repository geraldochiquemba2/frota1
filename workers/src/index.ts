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
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.get("/", (c) => {
  return c.json({ 
    message: "FleetTrack API - Cloudflare Workers",
    version: "1.0.0",
    status: "running"
  });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy" });
});

app.route("/api/auth", authRoutes);
app.route("/api/vehicles", vehicleRoutes);
app.route("/api/drivers", driverRoutes);
app.route("/api/trips", tripRoutes);
app.route("/api/maintenance", maintenanceRoutes);
app.route("/api/alerts", alertRoutes);
app.route("/api/metrics", metricsRoutes);
app.route("/api/driver", driverAppRoutes);

app.notFound((c) => {
  return c.json({ error: "Endpoint não encontrado" }, 404);
});

app.onError((err, c) => {
  console.error("Error:", err);
  return c.json({ error: "Erro interno do servidor" }, 500);
});

export default app;
