import { Hono } from "hono";
import { createDb } from "../lib/db";
import { alerts, insertAlertSchema } from "../schema";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const alertRoutes = new Hono<AppEnv>();

alertRoutes.use("*", authMiddleware);

alertRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allAlerts = await db
      .select()
      .from(alerts)
      .where(eq(alerts.dismissed, false))
      .orderBy(desc(alerts.timestamp));
    return c.json(allAlerts);
  } catch (error) {
    return c.json({ error: "Erro ao buscar alertas" }, 500);
  }
});

alertRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = insertAlertSchema.safeParse(body);

    if (!parsed.success) {
      return c.json({ error: "Dados inválidos", details: parsed.error }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const [alert] = await db.insert(alerts).values(parsed.data).returning();

    return c.json(alert, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar alerta" }, 500);
  }
});

alertRoutes.patch("/:id/dismiss", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db
      .update(alerts)
      .set({ dismissed: true })
      .where(eq(alerts.id, id))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Alerta não encontrado" }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erro ao dispensar alerta" }, 500);
  }
});

alertRoutes.post("/dismiss-all", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    await db.update(alerts).set({ dismissed: true }).where(eq(alerts.dismissed, false));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erro ao dispensar alertas" }, 500);
  }
});
