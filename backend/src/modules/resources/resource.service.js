import { resourceRepository } from "./resource.repository.js";
import { auditService } from "../audit/audit.service.js";
import { HttpError } from "../../utils/httpError.js";

const ALLOWED_BOOKING_MODES = ["NONE", "REQUEST", "SLOT"];

export const resourceService = {
  async createResource(user, data) {
    // 1. Municipality enforcement
    if (!user.municipalityId) {
      throw new HttpError(403, "Municipal admin must belong to a municipality");
    }

    // 2. Whitelist input
    const {
      title,
      description,
      category,
      resourceType,
      bookingMode = "NONE",
      capacity
    } = data;

    if (!title || !category || !resourceType) {
      throw new HttpError(400, "Missing required fields");
    }

    if (!ALLOWED_BOOKING_MODES.includes(bookingMode)) {
      throw new HttpError(400, "Invalid booking mode");
    }

    if (
      capacity !== undefined &&
      (!Number.isInteger(capacity) || capacity <= 0)
    ) {
      throw new HttpError(400, "Capacity must be a positive integer");
    }

    // 3. Create resource
    const resource = await resourceRepository.create({
      title,
      description,
      category,
      resourceType,
      bookingMode,
      capacity,
      status: "DRAFT",
      municipalityId: user.municipalityId,
      createdById: user.id
    });

    // 4. Audit log
    await auditService.log({
      actorId: user.id,
      action: "CREATE_RESOURCE",
      entityType: "RESOURCE",
      entityId: resource.id,
      afterData: resource
    });

    // 5. Controlled response
    return {
      id: resource.id,
      title: resource.title,
      status: resource.status,
      municipalityId: resource.municipalityId
    };
  }
};
