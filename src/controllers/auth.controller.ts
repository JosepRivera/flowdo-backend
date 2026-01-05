import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { access } from "node:fs";

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

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
      }

      const result = await authService.refresh(refreshToken);

      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
      });

      console.log("Cookies received:", req.cookies);

      return res.json({ accessToken: result.accessToken });
    } catch (error) {
      return res.status(401).json({ message: "Refresh failed" });
    }
  },
  
  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      await authService.logout(refreshToken);

      res.clearCookie("refresh_token");
      return res.sendStatus(204);
    } catch {
      return res.status(500).json({ message: "Logout failed" });
    }
  },
};
