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
  }
};
