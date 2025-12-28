import express from "express";
import { createBooking, getMyBookings } from "./booking.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { createSlotBooking } from "./booking.controller.js";

const router = express.Router();

import { approveBooking } from "./booking.controller.js";
import { rejectBooking } from "./booking.controller.js";

router.get(
  "/my",
  authMiddleware,
  rbacMiddleware("USER"),
  getMyBookings
);


router.post(
  "/",
  authMiddleware,
  rbacMiddleware("USER"),
  createBooking
);

router.post(
  "/slot",
  authMiddleware,
  rbacMiddleware("USER"),
  createSlotBooking
);

router.post(
  "/:id/approve",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  approveBooking
);


router.post(
  "/:id/reject",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  rejectBooking
);


export default router;
