import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const hashToken = (token: string) =>
  crypto.createHash("sha-256").update(token).digest("hex");

export const authService = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (exists) throw new Error("EMAIL_EXISTS");

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: { ...data, password: passwordHash },
      select: { id: true, email: true },
    });

    const accessToken = signAccessToken({ sub: String(user.id) });
    const refreshToken = signRefreshToken({ sub: String(user.id) });

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded.exp) {
      throw new Error("Invalid refresh token");
    }

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(decoded.exp * 1000),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("INVALID_CREDENTIALS");
    const validate = await comparePassword(password, user.password);
    if (!validate) throw new Error("INVALID_CREDENTIALS");

    const accessToken = signAccessToken({ sub: String(user.id) });
    const refreshToken = signRefreshToken({ sub: String(user.id) });

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded.exp) {
      throw new Error("Invalid refresh token");
    }

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(decoded.exp * 1000),
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded.sub || !decoded.exp) {
      throw new Error("INVALID_REFRESH");
    }

    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
    });

    if (!stored || stored.revokedAt) {
      throw new Error("INVALID_REFRESH");
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const newAccess = signAccessToken({ sub: decoded.sub });
    const newRefresh = signRefreshToken({ sub: decoded.sub });
    const newDecoded = verifyRefreshToken(newRefresh);

    if (!newDecoded.exp) {
      throw new Error("Invalid refresh token");
    }

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(newRefresh),
        userId: Number(decoded.sub),
        expiresAt: new Date(newDecoded.exp * 1000),
      },
    });
    return { accessToken: newAccess, refreshToken: newRefresh };
  },

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },
};
