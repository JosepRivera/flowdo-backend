import { Router } from "express";
import { prisma } from "../config/prisma.js";

const router = Router();

/**
 * GET /api/prisma-test
 * Prueba de conexión a la base de datos
 */
router.get("/prisma-test", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      ok: true,
      message: "Prisma conectado correctamente",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error conectando a la base de datos",
      error: (error as Error).message,
    });
  }
});

export default router;
