import { Hono } from "hono";
import { createDb } from "../lib/db";
import { fuelLogs } from "../schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const fuelRoutes = new Hono<AppEnv>();

fuelRoutes.use("*", authMiddleware);

fuelRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const logs = await db.select().from(fuelLogs).orderBy(desc(fuelLogs.date));
    return c.json(logs);
  } catch (error) {
    console.error("Error fetching fuel logs:", error);
    return c.json({ error: "Erro ao buscar abastecimentos" }, 500);
  }
});

fuelRoutes.get("/stats", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allLogs = await db.select().from(fuelLogs).orderBy(desc(fuelLogs.date));

    const totalLiters = allLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
    const totalCost = allLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);

    let totalKm = 0;
    let totalLitersForEfficiency = 0;

    const logsByVehicle: { [key: string]: typeof allLogs } = {};
    for (const log of allLogs) {
      if (!logsByVehicle[log.vehicleId]) {
        logsByVehicle[log.vehicleId] = [];
      }
      logsByVehicle[log.vehicleId].push(log);
    }

    for (const vehicleLogs of Object.values(logsByVehicle)) {
      const sorted = vehicleLogs.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      for (let i = 1; i < sorted.length; i++) {
        const kmDiff = sorted[i].odometer - sorted[i - 1].odometer;
        if (kmDiff > 0 && sorted[i].liters > 0) {
          totalKm += kmDiff;
          totalLitersForEfficiency += sorted[i].liters;
        }
      }
    }

    const avgEfficiency =
      totalLitersForEfficiency > 0 ? totalKm / totalLitersForEfficiency : 0;

    return c.json({
      totalLiters,
      totalCost,
      avgEfficiency,
      recentLogs: allLogs.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching fuel stats:", error);
    return c.json({ error: "Erro ao buscar estatísticas de combustível" }, 500);
  }
});

fuelRoutes.get("/vehicle/:vehicleId", async (c) => {
  try {
    const vehicleId = c.req.param("vehicleId");
    const db = createDb(c.env.DATABASE_URL);
    const logs = await db
      .select()
      .from(fuelLogs)
      .where(eq(fuelLogs.vehicleId, vehicleId))
      .orderBy(desc(fuelLogs.date));
    return c.json(logs);
  } catch (error) {
    return c.json({ error: "Erro ao buscar abastecimentos do veículo" }, 500);
  }
});

fuelRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [log] = await db.select().from(fuelLogs).where(eq(fuelLogs.id, id));

    if (!log) {
      return c.json({ error: "Abastecimento não encontrado" }, 404);
    }

    return c.json(log);
  } catch (error) {
    return c.json({ error: "Erro ao buscar abastecimento" }, 500);
  }
});

fuelRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.vehicleId || !body.vehiclePlate || body.odometer == null || body.liters == null || body.pricePerLiter == null || body.totalCost == null) {
      return c.json({ error: "Campos obrigatórios não preenchidos" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const logData: typeof fuelLogs.$inferInsert = {
      vehicleId: body.vehicleId,
      vehiclePlate: body.vehiclePlate,
      driverId: body.driverId ?? null,
      driverName: body.driverName ?? null,
      odometer: body.odometer,
      liters: body.liters,
      pricePerLiter: body.pricePerLiter,
      totalCost: body.totalCost,
      fuelType: body.fuelType ?? null,
      station: body.station ?? null,
      supplierId: body.supplierId ?? null,
      notes: body.notes ?? null,
    };
    const [log] = await db.insert(fuelLogs).values(logData).returning();

    return c.json(log, 201);
  } catch (error) {
    console.error("Error creating fuel log:", error);
    return c.json({ error: "Erro ao registrar abastecimento" }, 500);
  }
});

fuelRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(fuelLogs)
      .set(body)
      .where(eq(fuelLogs.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Abastecimento não encontrado" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar abastecimento" }, 500);
  }
});

fuelRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(fuelLogs).where(eq(fuelLogs.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Abastecimento não encontrado" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir abastecimento" }, 500);
  }
});
