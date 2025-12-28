import express from "express";
import { createResource,submitResource,publishResource,getResourceSlots,listMyResources} from "./resource.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../../middlewares/rbac.middleware.js";
import { listPublicResources } from "./resource.controller.js";
import { createSlot } from "./resource.controller.js";


const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  listMyResources
);

router.get("/", listPublicResources);

router.get("/:id/slots", getResourceSlots);


router.post(
  "/:id/slots",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  createSlot
);


router.post(
  "/",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  createResource
);

router.post(
  "/:id/submit",
  authMiddleware,
  rbacMiddleware("MUNICIPAL_ADMIN"),
  submitResource
);

router.post(
  "/:id/publish",
  authMiddleware,
  rbacMiddleware("CENTRAL_ADMIN"),
  publishResource
);



export default router;
