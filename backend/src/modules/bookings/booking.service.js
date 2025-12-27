import { bookingRepository } from "./booking.repository.js";
import { resourceRepository } from "../resources/resource.repository.js";
import { auditService } from "../audit/audit.service.js";
import { HttpError } from "../../utils/httpError.js";

export const bookingService = {
  async createBooking(user, data) {
    const { resourceId, startTime, endTime } = data;

    if (!resourceId || !startTime || !endTime) {
      throw new HttpError(400, "Missing required fields");
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end) || start >= end) {
      throw new HttpError(400, "Invalid booking time range");
    }

    // 1. Fetch resource
    const resource = await resourceRepository.findById(resourceId);

    if (!resource) {
      throw new HttpError(404, "Resource not found");
    }

    // 2. Resource state checks
    if (resource.status !== "PUBLISHED") {
      throw new HttpError(400, "Resource is not available for booking");
    }

    if (resource.bookingMode !== "REQUEST") {
      throw new HttpError(
        400,
        "This resource does not support request-based booking"
      );
    }

    // 🔒 3. DUPLICATE PENDING CHECK (NEW)
    const existingPending =
      await bookingRepository.findPendingOverlap({
        resourceId,
        userId: user.id,
        startTime: start,
        endTime: end
      });

    if (existingPending) {
      throw new HttpError(
        409,
        "You already have a pending booking for this resource in this time range"
      );
    }

    // 4. Create booking
    const booking = await bookingRepository.create({
      resourceId,
      userId: user.id,
      startTime: start,
      endTime: end,
      status: "PENDING"
    });

    // 5. Audit log
    await auditService.log({
      actorId: user.id,
      action: "CREATE_BOOKING",
      entityType: "BOOKING",
      entityId: booking.id,
      afterData: {
        resourceId,
        startTime,
        endTime,
        status: "PENDING"
      }
    });

    return {
      id: booking.id,
      status: booking.status,
      resourceId: booking.resourceId
    };
  },
  async rejectBooking(user, bookingId, reason) {
  if (!reason || typeof reason !== "string") {
    throw new HttpError(400, "Rejection reason is required");
  }

  // 1. Fetch booking with resource
  const booking = await bookingRepository.findByIdWithResource(bookingId);

  if (!booking) {
    throw new HttpError(404, "Booking not found");
  }

  // 2. State check
  if (booking.status !== "PENDING") {
    throw new HttpError(400, "Only PENDING bookings can be rejected");
  }

  // 3. Municipality ownership check
  if (booking.resource.municipalityId !== user.municipalityId) {
    throw new HttpError(403, "You cannot reject this booking");
  }

  // 4. Reject booking
  const updated = await bookingRepository.updateStatus(
    bookingId,
    "REJECTED",
    user.id
  );

  // 5. Audit log (include reason)
  await auditService.log({
    actorId: user.id,
    action: "REJECT_BOOKING",
    entityType: "BOOKING",
    entityId: bookingId,
    beforeData: { status: "PENDING" },
    afterData: { status: "REJECTED", reason }
  });

  return {
    id: updated.id,
    status: updated.status
  };
},
async createSlotBooking(user, slotId) {
  if (!slotId) {
    throw new HttpError(400, "slotId is required");
  }

  // 1. Fetch slot with resource
  const slot = await bookingRepository.findSlotWithResource(slotId);

  if (!slot || !slot.isActive) {
    throw new HttpError(404, "Slot not found");
  }

  const resource = slot.resource;

  // 2. Resource checks
  if (resource.status !== "PUBLISHED") {
    throw new HttpError(400, "Resource is not available for booking");
  }

  if (resource.bookingMode !== "SLOT") {
    throw new HttpError(
      400,
      "This resource does not support slot-based booking"
    );
  }

  // 3. Duplicate pending check
  const existingPending =
    await bookingRepository.findPendingSlotBooking({
      slotId,
      userId: user.id
    });

  if (existingPending) {
    throw new HttpError(
      409,
      "You already have a pending booking for this slot"
    );
  }

  // 4. Create booking
  const booking = await bookingRepository.create({
    resourceId: resource.id,
    userId: user.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: "PENDING"
  });

  // 5. Audit log
  await auditService.log({
    actorId: user.id,
    action: "CREATE_SLOT_BOOKING",
    entityType: "BOOKING",
    entityId: booking.id,
    afterData: {
      slotId,
      resourceId: resource.id,
      status: "PENDING"
    }
  });

  return {
    id: booking.id,
    status: booking.status,
    slotId
  };
}


};
