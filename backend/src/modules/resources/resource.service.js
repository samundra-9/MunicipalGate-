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
  },
  async submitResource(user, resourceId) {
  // 1. Municipality enforcement
  if (!user.municipalityId) {
    throw new HttpError(403, "Municipal admin must belong to a municipality");
  }

  // 2. Fetch resource
  const resource = await resourceRepository.findById(resourceId);

  if (!resource) {
    throw new HttpError(404, "Resource not found");
  }

  // 3. Ownership check
  if (resource.municipalityId !== user.municipalityId) {
    throw new HttpError(403, "You do not own this resource");
  }

  // 4. State check
  if (resource.status !== "DRAFT") {
    throw new HttpError(
      400,
      "Only DRAFT resources can be submitted for approval"
    );
  }

  // 5. Update status
  const updated = await resourceRepository.updateStatus(
    resourceId,
    "PENDING_APPROVAL"
  );

  // 6. Audit log
  await auditService.log({
    actorId: user.id,
    action: "SUBMIT_RESOURCE",
    entityType: "RESOURCE",
    entityId: resourceId,
    beforeData: { status: "DRAFT" },
    afterData: { status: "PENDING_APPROVAL" }
  });

  return {
    id: updated.id,
    status: updated.status
  };
},
async publishResource(user, resourceId) {
  // 1. Fetch resource
  const resource = await resourceRepository.findById(resourceId);

  if (!resource) {
    throw new HttpError(404, "Resource not found");
  }

  // 2. State check
  if (resource.status !== "PENDING_APPROVAL") {
    throw new HttpError(
      400,
      "Only PENDING_APPROVAL resources can be published"
    );
  }

  // 3. Publish
  const updated = await resourceRepository.updateStatus(
    resourceId,
    "PUBLISHED"
  );

  // 4. Audit log
  await auditService.log({
    actorId: user.id,
    action: "PUBLISH_RESOURCE",
    entityType: "RESOURCE",
    entityId: resourceId,
    beforeData: { status: "PENDING_APPROVAL" },
    afterData: { status: "PUBLISHED" }
  });

  return {
    id: updated.id,
    status: updated.status
  };
},
async listPublicResources(filters) {
  const {
    provinceId,
    districtId,
    municipalityId,
    category,
    resourceType
  } = filters;

  return resourceRepository.findPublic({
    provinceId: provinceId ? Number(provinceId) : undefined,
    districtId: districtId ? Number(districtId) : undefined,
    municipalityId: municipalityId ? Number(municipalityId) : undefined,
    category,
    resourceType
  });
},
async listMyResources(user) {
  // 1. Municipality enforcement
  if (!user.municipalityId) {
    throw new HttpError(403, "Municipal admin must belong to a municipality");
  }

  // 2. Fetch resources created by this user (all statuses)
  return resourceRepository.findByCreator({
    createdById: user.id,
    municipalityId: user.municipalityId
  });
},
async createSlot(user, resourceId, startTime, endTime) {
  if (!startTime || !endTime) {
    throw new HttpError(400, "startTime and endTime are required");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start) || isNaN(end) || start >= end) {
    throw new HttpError(400, "Invalid slot time range");
  }

  // 1. Fetch resource
  const resource = await resourceRepository.findById(resourceId);

  if (!resource) {
    throw new HttpError(404, "Resource not found");
  }

  // 2. Ownership check
  if (resource.municipalityId !== user.municipalityId) {
    throw new HttpError(403, "You do not own this resource");
  }

  // 3. State + mode check
  if (resource.status !== "PUBLISHED") {
    throw new HttpError(400, "Slots can only be added to PUBLISHED resources");
  }

  if (resource.bookingMode !== "SLOT") {
    throw new HttpError(
      400,
      "Slots can only be added to SLOT-based resources"
    );
  }

  // 4. Overlap check (CRITICAL)
  const conflict = await resourceRepository.hasSlotOverlap({
    resourceId,
    startTime: start,
    endTime: end
  });

  if (conflict) {
    throw new HttpError(
      409,
      "Slot overlaps with an existing slot"
    );
  }

  // 5. Create slot
  const slot = await resourceRepository.createSlot({
    resourceId,
    startTime: start,
    endTime: end
  });

  // 6. Audit log
  await auditService.log({
    actorId: user.id,
    action: "CREATE_SLOT",
    entityType: "RESOURCE_SLOT",
    entityId: slot.id,
    afterData: {
      resourceId,
      startTime,
      endTime
    }
  });

  return {
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime
  };
},
async getSlots(resourceId) {
  return resourceRepository.findActiveSlots(resourceId);
},

async updateDraftResource(user, resourceId, data) {
  const resource = await resourceRepository.findById(resourceId);

  if (!resource) {
    throw new HttpError(404, "Resource not found");
  }

  // ownership
  if (resource.municipalityId !== user.municipalityId) {
    throw new HttpError(403, "You do not own this resource");
  }

  // state gate
  if (resource.status !== "DRAFT") {
    throw new HttpError(400, "Only DRAFT resources can be edited");
  }

  // whitelist fields (do NOT allow status changes)
  const {
    title,
    description,
    category,
    resourceType,
    bookingMode,
    capacity
  } = data;

  const updated = await resourceRepository.update(resourceId, {
    title,
    description,
    category,
    resourceType,
    bookingMode,
    capacity
  });

  await auditService.log({
    actorId: user.id,
    action: "UPDATE_RESOURCE_DRAFT",
    entityType: "RESOURCE",
    entityId: resourceId,
    beforeData: { status: "DRAFT" },
    afterData: updated
  });

  return updated;
}


};


