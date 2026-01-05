import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      res.cookie("refresh_token", result.refreshToken, { httpOnly: true });
      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch {
      res.status(400).json({
        message: "Register failed",
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.cookie("refresh_token", result.refreshToken, { httpOnly: true });
      res.json(result);
    } catch {
      res.status(401).json({ message: "Invalid credentials" });
    }
  },
};
