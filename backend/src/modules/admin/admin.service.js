import { prisma } from "../../config/db.js";
import { HttpError } from "../../utils/httpError.js";

export const adminService = {
  async getPendingBookings(user) {
    if (!user.municipalityId) {
      throw new HttpError(403, "Municipality admin only");
    }

    return prisma.booking.findMany({
      where: {
        status: "PENDING",
        resource: {
          municipalityId: user.municipalityId
        }
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        resource: {
          select: {
            id: true,
            title: true,
            bookingMode: true
          }
        }
      },
      orderBy: {
        requestedAt: "asc"
      }
    });
  },
  async getPendingResources() {
  return prisma.resource.findMany({
    where: {
      status: "PENDING_APPROVAL"
    },
    select: {
      id: true,
      title: true,
      category: true,
      resourceType: true,
      municipality: {
        select: {
          id: true,
          name: true,
          district: {
            select: {
              name: true,
              province: {
                select: { name: true }
              }
            }
          }
        }
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      createdAt: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
},
async findPendingApproval() {
  return prisma.resource.findMany({
    where: { status: "PENDING_APPROVAL" },
    include: {
      municipality: {
        include: { district: { include: { province: true } } }
      },
      createdBy: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

};
