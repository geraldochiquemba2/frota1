import { Context, Next } from "hono";
import { verifyToken } from "../lib/jwt";
import type { AppEnv } from "../index";

type AppContext = Context<AppEnv>;

export async function authMiddleware(c: AppContext, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Não autorizado" }, 401);
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: "Token inválido ou expirado" }, 401);
  }

  c.set("user", payload);
  await next();
}

export async function adminMiddleware(c: AppContext, next: Next) {
  const user = c.get("user");
  
  if (user.userType !== "admin") {
    return c.json({ error: "Acesso restrito a administradores" }, 403);
  }

  await next();
}

export async function driverMiddleware(c: AppContext, next: Next) {
  const user = c.get("user");
  
  if (user.userType !== "driver") {
    return c.json({ error: "Acesso restrito a motoristas" }, 403);
  }

  await next();
}
