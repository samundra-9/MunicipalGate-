import { prisma } from "../../config/db.js";

export const resourceRepository = {
  async create(data) {
    return prisma.resource.create({
      data
    });
  }
};
