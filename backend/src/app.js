import express from "express";
import cors from "cors";

// ROUTES
import resourceRoutes from "./modules/resources/resource.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import bookingRoutes from "./modules/bookings/booking.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";


// MIDDLEWARES
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// -------- GLOBAL MIDDLEWARE --------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------- ROUTES --------
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);


// -------- HEALTH CHECK --------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// -------- ERROR HANDLER (LAST) --------
app.use(errorMiddleware);

export default app;
