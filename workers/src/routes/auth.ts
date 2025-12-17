import { Hono } from "hono";
import { createDb } from "../lib/db";
import { createToken, verifyToken } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import { adminUsers, drivers, insertDriverSchema } from "../schema";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../index";

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, password, name } = body;

    if (!phone || !password || !name) {
      return c.json({ error: "Todos os campos são obrigatórios" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Senha deve ter pelo menos 6 caracteres" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    const existingDriver = await db
      .select()
      .from(drivers)
      .where(eq(drivers.phone, phone))
      .limit(1);

    if (existingDriver.length > 0) {
      return c.json({ error: "Este número já está cadastrado" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    const [newDriver] = await db
      .insert(drivers)
      .values({
        phone,
        password: hashedPassword,
        name,
        status: "available",
      })
      .returning();

    const token = await createToken(
      {
        userId: newDriver.id,
        userType: "driver",
        phone: newDriver.phone,
        name: newDriver.name,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      id: newDriver.id,
      phone: newDriver.phone,
      name: newDriver.name,
      type: "driver",
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ error: "Erro ao criar conta" }, 500);
  }
});

authRoutes.post("/login", async (c) => {
  try {
    console.log("[Login] Login attempt started");
    
    // Debug: Check if environment variables are available
    if (!c.env.DATABASE_URL) {
      console.error("[Login] DATABASE_URL is not defined");
      return c.json({ error: "Configuração do servidor incompleta: DATABASE_URL" }, 500);
    }
    if (!c.env.JWT_SECRET) {
      console.error("[Login] JWT_SECRET is not defined");
      return c.json({ error: "Configuração do servidor incompleta: JWT_SECRET" }, 500);
    }

    const { phone, password } = await c.req.json();
    console.log("[Login] Attempting login for phone:", phone);

    if (!phone || !password) {
      return c.json({ error: "Número e senha são obrigatórios" }, 400);
    }

    const db = createDb(c.env.DATABASE_URL);

    const [adminUser] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.phone, phone))
      .limit(1);

    if (adminUser) {
      console.log("[Login] Admin user found:", adminUser.id);
      const isValidPassword = await verifyPassword(password, adminUser.password);
      if (isValidPassword || adminUser.password === password) {
        console.log("[Login] Admin password valid, generating token");
        const token = await createToken(
          {
            userId: adminUser.id,
            userType: "admin",
            phone: adminUser.phone,
            name: adminUser.name,
          },
          c.env.JWT_SECRET
        );

        console.log("[Login] Admin login successful, token generated (length:", token.length, ")");
        return c.json({
          id: adminUser.id,
          phone: adminUser.phone,
          name: adminUser.name,
          type: "admin",
          token,
        });
      }
    }

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.phone, phone))
      .limit(1);

    if (driver && driver.password) {
      console.log("[Login] Driver found:", driver.id);
      const isValidPassword = await verifyPassword(password, driver.password);
      if (isValidPassword || driver.password === password) {
        console.log("[Login] Driver password valid, generating token");
        const token = await createToken(
          {
            userId: driver.id,
            userType: "driver",
            phone: driver.phone,
            name: driver.name,
          },
          c.env.JWT_SECRET
        );

        console.log("[Login] Driver login successful, token generated (length:", token.length, ")");
        return c.json({
          id: driver.id,
          phone: driver.phone,
          name: driver.name,
          type: "driver",
          token,
        });
      }
    }

    console.log("[Login] Login failed - no matching user or invalid password");
    return c.json({ error: "Credenciais inválidas" }, 401);
  } catch (error: any) {
    console.error("Login error:", error);
    const errorMessage = error?.message || String(error);
    return c.json({ 
      error: "Erro ao fazer login", 
      details: errorMessage 
    }, 500);
  }
});

authRoutes.post("/logout", async (c) => {
  return c.json({ success: true });
});

authRoutes.get("/user", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    console.log("[GetUser] Request received, Authorization header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[GetUser] No valid Authorization header found");
      return c.json({ error: "Não autenticado" }, 401);
    }

    const token = authHeader.substring(7);
    console.log("[GetUser] Token received (length:", token.length, ")");
    
    const payload = await verifyToken(token, c.env.JWT_SECRET);

    if (!payload) {
      console.log("[GetUser] Token verification failed");
      return c.json({ error: "Token inválido ou expirado" }, 401);
    }
    
    console.log("[GetUser] Token verified for user:", payload.userId, "type:", payload.userType);

    const db = createDb(c.env.DATABASE_URL);

    if (payload.userType === "driver") {
      const [driver] = await db
        .select()
        .from(drivers)
        .where(eq(drivers.id, payload.userId))
        .limit(1);

      if (!driver) {
        return c.json({ error: "Usuário não encontrado" }, 401);
      }

      return c.json({
        id: driver.id,
        phone: driver.phone,
        name: driver.name,
        type: "driver",
      });
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, payload.userId))
      .limit(1);

    if (!user) {
      return c.json({ error: "Usuário não encontrado" }, 401);
    }

    return c.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      type: "admin",
    });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Erro ao buscar usuário" }, 500);
  }
});
