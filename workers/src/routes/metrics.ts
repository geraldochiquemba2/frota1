import { Hono } from "hono";
import { createDb } from "../lib/db";
import { vehicles, drivers, alerts, maintenance } from "../schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const metricsRoutes = new Hono<AppEnv>();

metricsRoutes.use("*", authMiddleware);

metricsRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);

    const allVehicles = await db.select().from(vehicles);
    const allDrivers = await db.select().from(drivers);
    const activeAlertsList = await db
      .select()
      .from(alerts)
      .where(eq(alerts.dismissed, false));
    const maintenanceList = await db
      .select()
      .from(maintenance)
      .where(eq(maintenance.status, "scheduled"));

    return c.json({
      totalVehicles: allVehicles.length,
      activeDrivers: allDrivers.filter(
        (d) => d.status === "on-trip" || d.status === "available"
      ).length,
      activeAlerts: activeAlertsList.length,
      maintenanceDue: maintenanceList.length,
    });
  } catch (error) {
    return c.json({ error: "Erro ao buscar métricas" }, 500);
  }
});
