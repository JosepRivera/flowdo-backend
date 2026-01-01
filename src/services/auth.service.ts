import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { hashPassword } from "../utils/password.js";
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
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  },
};
