import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { getPendingBookings } from "./admin.controller.js";
import { getPendingResources } from "./admin.controller.js";

const router = express.Router();

router.get(
  "/bookings/pending",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  getPendingBookings
);

router.get(
  "/resources/pending",
  authMiddleware,
  rbacMiddleware("CENTRAL_ADMIN"),
  getPendingResources
);
export default router;
