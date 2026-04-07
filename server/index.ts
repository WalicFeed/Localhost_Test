import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTH_COOKIE = "auth_token";

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== "production") {
    // Dev-only fallback — never use in production
    return "dev-secret-key-change-me-in-env";
  }
  throw new Error("JWT_SECRET must be set and at least 16 characters");
}

async function build() {
  const app = Fastify({ logger: true });

  await app.register(cookie, {
    hook: "onRequest",
    parseOptions: {},
  });

  await app.register(jwt, {
    secret: getJwtSecret(),
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.get("/api/health", async () => ({ ok: true }));

  app.post("/api/register", async (request, reply) => {
    const body = request.body as {
      email?: string;
      name?: string;
    };
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!email || !name) {
      return reply.status(400).send({ error: "Укажите email и имя" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: "Этот email уже зарегистрирован" });
    }

    const user = await prisma.user.create({
      data: { email, name },
    });

    const token = await reply.jwtSign(
      { sub: user.id, email: user.email, name: user.name },
      { expiresIn: "7d" }
    );

    reply.setCookie(AUTH_COOKIE, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  });

  app.post("/api/logout", async (_request, reply) => {
    reply.clearCookie(AUTH_COOKIE, { path: "/" });
    return { ok: true };
  });

  return app;
}

const port = Number(process.env.PORT) || 4000;
const host = process.env.HOST || "0.0.0.0";

build()
  .then((app) =>
    app.listen({ port, host }).then(() => {
      app.log.info(`API listening on ${host}:${port}`);
    })
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
