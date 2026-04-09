import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendMagicLink } from "./lib/email";

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

  // Sign up - creates user and sends magic link
  app.post("/api/auth/signup", async (request, reply) => {
    const body = request.body as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return reply.status(400).send({ error: "Email is required" });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: "This email is already registered. Please use Login instead." });
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send magic link email
    try {
      await sendMagicLink(email, token);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: "Failed to send email. Please try again." });
    }

    return { 
      ok: true,
      message: "Check your email! We sent you a magic link to sign up." 
    };
  });

  // Login - sends magic link for existing users
  app.post("/api/auth/login", async (request, reply) => {
    const body = request.body as { email?: string };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return reply.status(400).send({ error: "Email is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(404).send({ error: "No account found with this email. Please sign up first." });
    }

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send magic link email
    try {
      await sendMagicLink(email, token);
    } catch (error) {
      app.log.error(error);
      return reply.status(500).send({ error: "Failed to send email. Please try again." });
    }

    return { 
      ok: true,
      message: "Check your email! We sent you a magic link to log in." 
    };
  });

  // Verify magic link token
  app.get("/api/auth/verify", async (request, reply) => {
    const query = request.query as { token?: string };
    const token = query.token;

    if (!token) {
      return reply.status(400).send({ error: "Invalid verification link" });
    }

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return reply.status(400).send({ error: "Invalid or expired verification link" });
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return reply.status(400).send({ error: "This verification link has expired. Please request a new one." });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      // Create new user (sign up flow)
      user = await prisma.user.create({
        data: {
          email: verificationToken.email,
        },
      });
    }

    // Delete used token
    await prisma.verificationToken.delete({ where: { token } });

    // Create JWT session
    const jwtToken = await reply.jwtSign(
      { 
        sub: user.id, 
        email: user.email, 
        onboarded: user.onboarded,
        paymentCompleted: user.paymentCompleted || user.paymentSkipped,
        brandVoiceCompleted: user.brandVoiceCompleted,
      },
      { expiresIn: "7d" }
    );

    reply.setCookie(AUTH_COOKIE, jwtToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    // Redirect based on completion status
    let redirectUrl = "/";
    if (!user.onboarded) {
      redirectUrl = "/onboarding";
    } else if (!user.paymentCompleted && !user.paymentSkipped) {
      redirectUrl = "/payment";
    } else if (!user.brandVoiceCompleted) {
      redirectUrl = "/brand-voice";
    }
    return reply.redirect(redirectUrl);
  });

  // Onboarding submission
  app.post("/api/onboarding", async (request, reply) => {
    // Verify user is authenticated
    const token = request.cookies[AUTH_COOKIE];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    let payload;
    try {
      payload = await request.jwtVerify() as { sub: string };
    } catch {
      return reply.status(401).send({ error: "Invalid session" });
    }

    const body = request.body as {
      role?: string;
      roleOther?: string | null;
      channel?: string;
      channelOther?: string | null;
      helpTopics?: string[];
      helpTopicsOther?: string | null;
    };

    const { role, roleOther, channel, channelOther, helpTopics, helpTopicsOther } = body;

    if (!role || !channel || !helpTopics || helpTopics.length === 0) {
      return reply.status(400).send({ error: "All fields are required" });
    }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        onboarded: true,
        role,
        roleOther,
        channel,
        channelOther,
        helpTopics,
        helpTopicsOther,
      },
    });

    // Issue new JWT with updated onboarded status
    const newToken = await reply.jwtSign(
      { 
        sub: updatedUser.id, 
        email: updatedUser.email, 
        onboarded: true,
        paymentCompleted: updatedUser.paymentCompleted || updatedUser.paymentSkipped,
        brandVoiceCompleted: updatedUser.brandVoiceCompleted,
      },
      { expiresIn: "7d" }
    );

    reply.setCookie(AUTH_COOKIE, newToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  });

  // Payment setup - save Stripe payment method
  app.post("/api/payment/setup", async (request, reply) => {
    const token = request.cookies[AUTH_COOKIE];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    let payload;
    try {
      payload = await request.jwtVerify() as { sub: string };
    } catch {
      return reply.status(401).send({ error: "Invalid session" });
    }

    const body = request.body as { paymentMethodId?: string };
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return reply.status(400).send({ error: "Payment method ID is required" });
    }

    // Get or create Stripe customer
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    let customerId = user.stripeCustomerId;

    // Note: Stripe integration would happen here
    // For now, we just store the payment method ID
    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        paymentCompleted: true,
        stripePaymentMethodId: paymentMethodId,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      },
    });

    // Issue new JWT with updated payment status
    const newToken = await reply.jwtSign(
      { 
        sub: updatedUser.id, 
        email: updatedUser.email, 
        onboarded: updatedUser.onboarded,
        paymentCompleted: true,
        brandVoiceCompleted: updatedUser.brandVoiceCompleted,
      },
      { expiresIn: "7d" }
    );

    reply.setCookie(AUTH_COOKIE, newToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  });

  // Skip payment (debug only)
  app.post("/api/payment/skip", async (request, reply) => {
    const token = request.cookies[AUTH_COOKIE];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    let payload;
    try {
      payload = await request.jwtVerify() as { sub: string };
    } catch {
      return reply.status(401).send({ error: "Invalid session" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        paymentSkipped: true,
      },
    });

    // Issue new JWT with payment skipped status
    const newToken = await reply.jwtSign(
      { 
        sub: updatedUser.id, 
        email: updatedUser.email, 
        onboarded: updatedUser.onboarded,
        paymentCompleted: true, // Set to true since skipped counts as completed
        brandVoiceCompleted: updatedUser.brandVoiceCompleted,
      },
      { expiresIn: "7d" }
    );

    reply.setCookie(AUTH_COOKIE, newToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return { ok: true };
  });

  // Brand voice submission
  app.post("/api/brand-voice", async (request, reply) => {
    const token = request.cookies[AUTH_COOKIE];
    if (!token) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    let payload;
    try {
      payload = await request.jwtVerify() as { sub: string };
    } catch {
      return reply.status(401).send({ error: "Invalid session" });
    }

    const body = request.body as { brandVoiceData?: Record<string, unknown> };
    const { brandVoiceData } = body;

    if (!brandVoiceData) {
      return reply.status(400).send({ error: "Brand voice data is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        brandVoiceCompleted: true,
        brandVoiceData,
      },
    });

    // Issue new JWT with brand voice completed status
    const newToken = await reply.jwtSign(
      { 
        sub: updatedUser.id, 
        email: updatedUser.email, 
        onboarded: updatedUser.onboarded,
        paymentCompleted: updatedUser.paymentCompleted || updatedUser.paymentSkipped,
        brandVoiceCompleted: true,
      },
      { expiresIn: "7d" }
    );

    reply.setCookie(AUTH_COOKIE, newToken, {
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
