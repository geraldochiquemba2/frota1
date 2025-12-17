import { Hono } from "hono";
import { createDb } from "../lib/db";
import { suppliers } from "../schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const supplierRoutes = new Hono<AppEnv>();

supplierRoutes.use("*", authMiddleware);

supplierRoutes.get("/", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allSuppliers = await db.select().from(suppliers);
    return c.json(allSuppliers);
  } catch (error) {
    return c.json({ error: "Erro ao buscar fornecedores" }, 500);
  }
});

supplierRoutes.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));

    if (!supplier) {
      return c.json({ error: "Fornecedor não encontrado" }, 404);
    }

    return c.json(supplier);
  } catch (error) {
    return c.json({ error: "Erro ao buscar fornecedor" }, 500);
  }
});

supplierRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name || typeof body.name !== 'string') {
      return c.json({ error: "Nome é obrigatório" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const supplierData: typeof suppliers.$inferInsert = {
      name: body.name,
      contact: body.contact ?? null,
      categories: Array.isArray(body.categories) ? body.categories : null,
      address: body.address ?? null,
      notes: body.notes ?? null,
    };
    const [supplier] = await db.insert(suppliers).values(supplierData).returning();

    return c.json(supplier, 201);
  } catch (error) {
    return c.json({ error: "Erro ao criar fornecedor" }, 500);
  }
});

supplierRoutes.patch("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(suppliers)
      .set(body)
      .where(eq(suppliers.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Fornecedor não encontrado" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar fornecedor" }, 500);
  }
});

supplierRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Fornecedor não encontrado" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir fornecedor" }, 500);
  }
});
