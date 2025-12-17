import { Hono } from "hono";
import { createDb } from "../lib/db";
import { maintenance, insertMaintenanceSchema } from "../schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const maintenanceRoutes = new Hono<AppEnv>();

maintenanceRoutes.use("*", authMiddleware);

maintenanceRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const records = await db.select().from(maintenance);
    return c.json(records);
  } catch (error) {
    return c.json({ error: "Erro ao buscar manutenções" }, 500);
  }
});

maintenanceRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [record] = await db.select().from(maintenance).where(eq(maintenance.id, id));

    if (!record) {
      return c.json({ error: "Manutenção não encontrada" }, 404);
    }

    return c.json(record);
  } catch (error) {
    return c.json({ error: "Erro ao buscar manutenção" }, 500);
  }
});

maintenanceRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = insertMaintenanceSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Dados inválidos", details: parsed.error }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const [record] = await db.insert(maintenance).values(parsed.data).returning();

    return c.json(record, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar manutenção" }, 500);
  }
});

maintenanceRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(maintenance)
      .set(body)
      .where(eq(maintenance.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Manutenção não encontrada" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar manutenção" }, 500);
  }
});
