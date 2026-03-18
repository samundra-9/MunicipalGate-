// backend/src/modules/auth/auth.service.js
import { prisma } from "../../config/db.js";
import { hashPassword } from "../../utils/password.js";
import { HttpError } from "../../utils/httpError.js";

export const authService = {
  async register({ name, email, password, municipalityId }) {
    // Validate required fields
    if (!name || !email || !password) {
      throw new HttpError(400, "Name, email, and password are required");
    }
    
    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }
    
    // Default role: USER; MUNICIPAL_ADMIN must be assigned by CENTRAL_ADMIN
    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        roleId: userRole.id,
        municipalityId,
        status: "ACTIVE"
      },
      include: { role: { select: { name: true } } }
    });
    
    // Audit: user registration
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_REGISTERED",
        entityType: "USER",
        entityId: user.id,
        afterData: { email: user.email, role: user.role.name }
      }
    });
    
    return user;
  }
};