import { Hono } from "hono";
import { createDb } from "../lib/db";
import { drivers, insertDriverSchema } from "../schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const driverRoutes = new Hono<AppEnv>();

driverRoutes.use("*", authMiddleware);

driverRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allDrivers = await db.select().from(drivers);
    return c.json(allDrivers);
  } catch (error) {
    return c.json({ error: "Erro ao buscar motoristas" }, 500);
  }
});

driverRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));

    if (!driver) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    return c.json(driver);
  } catch (error) {
    return c.json({ error: "Erro ao buscar motorista" }, 500);
  }
});

driverRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = insertDriverSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Dados inválidos", details: parsed.error }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const [driver] = await db.insert(drivers).values(parsed.data).returning();

    return c.json(driver, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar motorista" }, 500);
  }
});

driverRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(drivers)
      .set(body)
      .where(eq(drivers.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar motorista" }, 500);
  }
});

driverRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(drivers).where(eq(drivers.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir motorista" }, 500);
  }
});
