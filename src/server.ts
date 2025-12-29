import "dotenv/config";
import app from "./app.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  logger.success(`Server running on http://localhost:${PORT}`);
});

// Errores del servidor (puerto ocupado, permisos)
server.on("error", (error: NodeJS.ErrnoException) => {
  logger.error(`Server error: ${error.message}`);

  if (error.code === "EADDRINUSE") {
    logger.warn(`Port ${PORT} is already in use`);
  }

  process.exit(1);
});
