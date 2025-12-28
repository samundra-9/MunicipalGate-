import { prisma } from "../../config/db.js";

export const bookingRepository = {
  async create(data) {
    return prisma.booking.create({ data });
  },

  async findByIdWithResource(id) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        resource: true
      }
    });
  },

  async hasConflict({ resourceId, startTime, endTime }) {
    const conflict = await prisma.booking.findFirst({
      where: {
        resourceId,
        status: "APPROVED",
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    });

    return Boolean(conflict);
  },

  async updateStatus(id, status, decidedById) {
    return prisma.booking.update({
      where: { id },
      data: {
        status,
        decidedById,
        decidedAt: new Date()
      }
    });
  },
  async findPendingOverlap({ resourceId, userId, startTime, endTime }) {
  return prisma.booking.findFirst({
    where: {
      resourceId,
      userId,
      status: "PENDING",
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } }
      ]
    }
  });
},
async findSlotWithResource(slotId) {
  return prisma.resourceAvailability.findUnique({
    where: { id: slotId },
    include: {
      resource: true
    }
  });
},

async findPendingSlotBooking({ slotId, userId }) {
  const slot = await prisma.resourceAvailability.findUnique({
    where: { id: slotId }
  });

  if (!slot) return null;

  return prisma.booking.findFirst({
    where: {
      userId,
      resourceId: slot.resourceId,
      status: "PENDING",
      startTime: slot.startTime,
      endTime: slot.endTime
    }
  });
},
async findByUser(userId) {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      resource: {
        select: {
          title: true
        }
      }
    },
    orderBy: {
      requestedAt: "desc"
    }
  });
}
};

