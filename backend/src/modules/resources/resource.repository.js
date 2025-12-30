import { prisma } from "../../config/db.js";

export const resourceRepository = {
  async create(data) {
    return prisma.resource.create({ data });
  },

  async findById(id) {
    return prisma.resource.findUnique({
      where: { id }
    });
  },

  async updateStatus(id, status) {
    return prisma.resource.update({
      where: { id },
      data: { status }
    });
  },
  async findPublic(filters) {
    const {
      provinceId,
      districtId,
      municipalityId,
      category,
      resourceType
    } = filters;
    
    return prisma.resource.findMany({
      where: {
        status: "PUBLISHED",
        category: category || undefined,
        resourceType: resourceType || undefined,
        municipality: {
          id: municipalityId || undefined,
          district: {
            id: districtId || undefined,
            province: {
              id: provinceId || undefined
            }
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        resourceType: true,
        municipality: {
          select: {
            id: true,
            name: true,
            district: {
              select: {
                id: true,
                name: true,
                province: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });
  },
  async hasSlotOverlap({ resourceId, startTime, endTime }) {
  return Boolean(
    await prisma.resourceAvailability.findFirst({
      where: {
        resourceId,
        isActive: true,
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } }
        ]
      }
    })
  );
},
async findByCreator({ createdById, municipalityId }) {
  return prisma.resource.findMany({
    where: {
      createdById,
      municipalityId
    },
    orderBy: {
      createdAt: "desc"
    }
  });
},
async createSlot(data) {
  return prisma.resourceAvailability.create({
    data: {
      ...data,
      isActive: true
    }
  });
},
async findActiveSlots(resourceId) {
  return prisma.resourceAvailability.findMany({
    where: {
      resourceId,
      isActive: true
    },
    orderBy: { startTime: "asc" }
  });
} ,
async update(id, data) {
  return prisma.resource.update({
    where: { id },
    data
  });
}

};