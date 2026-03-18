import { prisma } from "../../config/db.js";

export const auditService = {
  async log({ actorId, action, entityType, entityId, beforeData, afterData }) {
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        beforeData,
        afterData
      }
    });
  },
  async getLogs(user) {
    if (user.role === "CENTRAL_ADMIN") {
      return prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100
      });
    }

    if (user.role === "MUNICIPAL_ADMIN") {
      return prisma.auditLog.findMany({
        where: {
          actor: {
            municipalityId: user.municipalityId
          }
        },
        orderBy: { createdAt: "desc" },
        take: 100
      });
    }

    // USER
    return prisma.auditLog.findMany({
      where: { actorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }
};

