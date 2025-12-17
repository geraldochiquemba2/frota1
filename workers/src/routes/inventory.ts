import { Hono } from "hono";
import { createDb } from "../lib/db";
import { inventoryItems } from "../schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const inventoryRoutes = new Hono<AppEnv>();

inventoryRoutes.use("*", authMiddleware);

inventoryRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allItems = await db.select().from(inventoryItems);
    return c.json(allItems);
  } catch (error) {
    return c.json({ error: "Erro ao buscar itens do inventário" }, 500);
  }
});

inventoryRoutes.get("/low-stock", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allItems = await db.select().from(inventoryItems);
    const lowStock = allItems.filter(item => item.quantity <= (item.minQuantity || 5));
    return c.json(lowStock);
  } catch (error) {
    return c.json({ error: "Erro ao buscar itens com stock baixo" }, 500);
  }
});

inventoryRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));

    if (!item) {
      return c.json({ error: "Item não encontrado" }, 404);
    }

    return c.json(item);
  } catch (error) {
    return c.json({ error: "Erro ao buscar item" }, 500);
  }
});

inventoryRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || typeof body.name !== 'string') {
      return c.json({ error: "Nome é obrigatório" }, 400);
    }

    if (!body.category || typeof body.category !== 'string') {
      return c.json({ error: "Categoria é obrigatória" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const itemData: typeof inventoryItems.$inferInsert = {
      name: body.name,
      partNumber: body.partNumber ?? null,
      category: body.category,
      quantity: body.quantity ?? 0,
      minQuantity: body.minQuantity ?? 5,
      unit: body.unit ?? "unidade",
      unitPrice: body.unitPrice ?? null,
      location: body.location ?? null,
      supplierId: body.supplierId ?? null,
      notes: body.notes ?? null,
    };
    const [item] = await db.insert(inventoryItems).values(itemData).returning();

    return c.json(item, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar item" }, 500);
  }
});

inventoryRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(inventoryItems)
      .set(body)
      .where(eq(inventoryItems.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Item não encontrado" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar item" }, 500);
  }
});

inventoryRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Item não encontrado" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir item" }, 500);
  }
});
