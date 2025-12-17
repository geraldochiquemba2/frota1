import { Hono } from "hono";
import { createDb } from "../lib/db";
import { trips, insertTripSchema } from "../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const tripRoutes = new Hono<AppEnv>();

tripRoutes.use("*", authMiddleware);

tripRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allTrips = await db.select().from(trips).orderBy(desc(trips.startTime));
    return c.json(allTrips);
  } catch (error) {
    return c.json({ error: "Erro ao buscar viagens" }, 500);
  }
});

tripRoutes.get("/active", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allTrips = await db.select().from(trips);
    const activeTrips = allTrips.filter((t) => t.status === "active");
    return c.json(activeTrips);
  } catch (error) {
    return c.json({ error: "Erro ao buscar viagens ativas" }, 500);
  }
});

tripRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));

    if (!trip) {
      return c.json({ error: "Viagem não encontrada" }, 404);
    }

    return c.json(trip);
  } catch (error) {
    return c.json({ error: "Erro ao buscar viagem" }, 500);
  }
});

tripRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = insertTripSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Dados inválidos", details: parsed.error }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const [trip] = await db.insert(trips).values(parsed.data).returning();

    return c.json(trip, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar viagem" }, 500);
  }
});

tripRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(trips)
      .set(body)
      .where(eq(trips.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Viagem não encontrada" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar viagem" }, 500);
  }
});
