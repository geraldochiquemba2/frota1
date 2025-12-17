import { Hono } from "hono";
import { createDb } from "../lib/db";
import { vehicles, drivers, insertVehicleSchema } from "../../../shared/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const vehicleRoutes = new Hono<AppEnv>();

vehicleRoutes.use("*", authMiddleware);

vehicleRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allVehicles = await db.select().from(vehicles);
    return c.json(allVehicles);
  } catch (error) {
    return c.json({ error: "Erro ao buscar veículos" }, 500);
  }
});

vehicleRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));

    if (!vehicle) {
      return c.json({ error: "Veículo não encontrado" }, 404);
    }

    return c.json(vehicle);
  } catch (error) {
    return c.json({ error: "Erro ao buscar veículo" }, 500);
  }
});

vehicleRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = insertVehicleSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Dados inválidos", details: parsed.error }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const [vehicle] = await db.insert(vehicles).values(parsed.data).returning();

    return c.json(vehicle, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar veículo" }, 500);
  }
});

vehicleRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(vehicles)
      .set(body)
      .where(eq(vehicles.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Veículo não encontrado" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar veículo" }, 500);
  }
});

vehicleRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Veículo não encontrado" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir veículo" }, 500);
  }
});

vehicleRoutes.post("/:id/assign-driver", async (c) => {
  try {
    const vehicleId = c.req.param("id");
    const { driverId } = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId));

    if (!vehicle) {
      return c.json({ error: "Veículo não encontrado" }, 404);
    }

    if (!driverId) {
      if (vehicle.driverId) {
        await db
          .update(drivers)
          .set({ assignedVehicleId: null })
          .where(eq(drivers.id, vehicle.driverId));
      }
      const [updatedVehicle] = await db
        .update(vehicles)
        .set({ driverId: null })
        .where(eq(vehicles.id, vehicleId))
        .returning();
      return c.json(updatedVehicle);
    }

    const [driver] = await db.select().from(drivers).where(eq(drivers.id, driverId));

    if (!driver) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    if (vehicle.driverId && vehicle.driverId !== driverId) {
      await db
        .update(drivers)
        .set({ assignedVehicleId: null })
        .where(eq(drivers.id, vehicle.driverId));
    }

    if (driver.assignedVehicleId && driver.assignedVehicleId !== vehicleId) {
      await db
        .update(vehicles)
        .set({ driverId: null })
        .where(eq(vehicles.id, driver.assignedVehicleId));
    }

    const [updatedVehicle] = await db
      .update(vehicles)
      .set({ driverId })
      .where(eq(vehicles.id, vehicleId))
      .returning();

    await db
      .update(drivers)
      .set({ assignedVehicleId: vehicleId })
      .where(eq(drivers.id, driverId));

    return c.json(updatedVehicle);
  } catch (error) {
    console.error("Error assigning driver:", error);
    return c.json({ error: "Erro ao atribuir motorista" }, 500);
  }
});
