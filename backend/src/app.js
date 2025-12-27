import express from "express";
import cors from "cors";

// ROUTES
import resourceRoutes from "./modules/resources/resource.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";


// MIDDLEWARES
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// -------- GLOBAL MIDDLEWARE --------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- ROUTES --------
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);

// -------- HEALTH CHECK --------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// -------- ERROR HANDLER (LAST) --------
app.use(errorMiddleware);

export default app;
