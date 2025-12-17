import { Hono } from "hono";
import { createDb } from "../lib/db";
import { bankAccounts, transactions } from "../schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const financeRoutes = new Hono<AppEnv>();

financeRoutes.use("*", authMiddleware);

// ==================== BANK ACCOUNTS ====================

financeRoutes.get("/accounts", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const accounts = await db.select().from(bankAccounts);
    return c.json(accounts);
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return c.json({ error: "Erro ao buscar contas bancárias" }, 500);
  }
});

financeRoutes.get("/accounts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));

    if (!account) {
      return c.json({ error: "Conta não encontrada" }, 404);
    }

    return c.json(account);
  } catch (error) {
    return c.json({ error: "Erro ao buscar conta bancária" }, 500);
  }
});

financeRoutes.post("/accounts", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.name) {
      return c.json({ error: "Nome da conta é obrigatório" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const accountData: typeof bankAccounts.$inferInsert = {
      name: body.name,
      bank: body.bank ?? null,
      accountNumber: body.accountNumber ?? null,
      balance: body.balance ?? 0,
      isActive: body.isActive ?? true,
      notes: body.notes ?? null,
    };
    const [account] = await db.insert(bankAccounts).values(accountData).returning();

    return c.json(account, 201);
  } catch (error) {
    console.error("Error creating bank account:", error);
    return c.json({ error: "Erro ao criar conta bancária" }, 500);
  }
});

financeRoutes.patch("/accounts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(bankAccounts)
      .set(body)
      .where(eq(bankAccounts.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Conta não encontrada" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar conta bancária" }, 500);
  }
});

financeRoutes.delete("/accounts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(bankAccounts).where(eq(bankAccounts.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Conta não encontrada" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir conta bancária" }, 500);
  }
});

// ==================== TRANSACTIONS ====================

financeRoutes.get("/transactions", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
    return c.json(allTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return c.json({ error: "Erro ao buscar transações" }, 500);
  }
});

financeRoutes.get("/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));

    if (!transaction) {
      return c.json({ error: "Transação não encontrada" }, 404);
    }

    return c.json(transaction);
  } catch (error) {
    return c.json({ error: "Erro ao buscar transação" }, 500);
  }
});

financeRoutes.post("/transactions", async (c) => {
  try {
    const body = await c.req.json();

    if (!body.type || !body.category || body.amount == null) {
      return c.json({ error: "Campos obrigatórios não preenchidos" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);
    const transactionData: typeof transactions.$inferInsert = {
      bankAccountId: body.bankAccountId ?? null,
      type: body.type,
      category: body.category,
      amount: body.amount,
      description: body.description ?? null,
      vehicleId: body.vehicleId ?? null,
      vehiclePlate: body.vehiclePlate ?? null,
      supplierId: body.supplierId ?? null,
      tripId: body.tripId ?? null,
      invoiceRef: body.invoiceRef ?? null,
    };
    const [transaction] = await db.insert(transactions).values(transactionData).returning();

    return c.json(transaction, 201);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return c.json({ error: "Erro ao criar transação" }, 500);
  }
});

financeRoutes.patch("/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [updated] = await db
      .update(transactions)
      .set(body)
      .where(eq(transactions.id, id))
      .returning();

    if (!updated) {
      return c.json({ error: "Transação não encontrada" }, 404);
    }

    return c.json(updated);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar transação" }, 500);
  }
});

financeRoutes.delete("/transactions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const result = await db.delete(transactions).where(eq(transactions.id, id)).returning();

    if (result.length === 0) {
      return c.json({ error: "Transação não encontrada" }, 404);
    }

    return c.body(null, 204);
  } catch (error) {
    return c.json({ error: "Erro ao excluir transação" }, 500);
  }
});

// ==================== SUMMARY ====================

financeRoutes.get("/summary", async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const allTransactions = await db.select().from(transactions);

    const totalIncome = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = allTransactions.filter(
      (t) => new Date(t.date) >= startOfMonth
    ).length;

    return c.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthTransactions,
    });
  } catch (error) {
    console.error("Error fetching finance summary:", error);
    return c.json({ error: "Erro ao buscar resumo financeiro" }, 500);
  }
});
