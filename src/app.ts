import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js"

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", testRoutes);
app.use("/auth", authRoutes)

export default app;
