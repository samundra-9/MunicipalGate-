import express from "express";
import { createResource } from "./resource.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  createResource
);

export default router;
