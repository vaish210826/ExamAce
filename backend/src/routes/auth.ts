import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "../lib/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { requireAuth } from "../middleware/auth";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/auth.schema";

const router = Router();

const sha256 = (v: string) =>
  crypto.createHash("sha256").update(v).digest("hex");

function toPublicUser(u: { id: string; email: string; fullName: string; createdAt: Date }) {
  return { id: u.id, email: u.email, fullName: u.fullName, createdAt: u.createdAt };
}

async function issueSession(
  res: import("express").Response,
  user: { id: string; email: string }
) {
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  await prisma.refreshToken.create({
    data: {
      tokenHash: sha256(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  return accessToken;
}

/* ---------- POST /api/auth/register ---------- */
router.post("/register", async (req, res, next) => {
  try {
    const { fullName, email, password } = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const user = await prisma.user.create({
      data: { fullName, email, passwordHash: await hashPassword(password) },
    });

    const accessToken = await issueSession(res, user);
    res.status(201).json({ accessToken, user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
});

/* ---------- POST /api/auth/login ---------- */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const accessToken = await issueSession(res, user);
    res.json({ accessToken, user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
});

/* ---------- POST /api/auth/refresh ---------- */
router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: "No refresh token" });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: sha256(token) },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: "Refresh token expired or revoked" });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "User no longer exists" });

    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = await issueSession(res, user);
    res.json({ accessToken, user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
});

/* ---------- POST /api/auth/logout ---------- */
router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { tokenHash: sha256(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: 0 });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* ---------- GET /api/auth/me ---------- */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
});

/* ---------- POST /api/auth/forgot-password ---------- */
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success (don't leak whether email exists)
    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      await prisma.passwordReset.create({
        data: {
          tokenHash: sha256(rawToken),
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
        },
      });

      // TODO: send via email service. For dev, log it.
      console.log(
        `[password-reset] link: ${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`
      );
    }

    res.json({ ok: true, message: "If that email exists, a reset link was sent." });
  } catch (e) {
    next(e);
  }
});

/* ---------- POST /api/auth/reset-password ---------- */
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const record = await prisma.passwordReset.findUnique({
      where: { tokenHash: sha256(token) },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    res.json({ ok: true, message: "Password updated. Please sign in." });
  } catch (e) {
    next(e);
  }
});

export default router;
