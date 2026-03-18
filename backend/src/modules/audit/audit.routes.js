import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getAuditLogs } from "./audit.controller.js";

const router = express.Router();

router.get(
  "/logs",
  authMiddleware,
  getAuditLogs
);

export default router;
