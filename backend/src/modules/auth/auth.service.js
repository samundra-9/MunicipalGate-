// backend/src/modules/auth/auth.service.js
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { HttpError } from "../../utils/httpError.js";

const JWT_SECRET = process.env.JWT_SECRET || "municipalgate-secret";

export const authService = {
  async register({ name, email, password, municipalityId }) {
    if (!name || !email || !password) {
      throw new HttpError(400, "Name, email, and password are required");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpError(409, "Email already registered");
    }

    const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
    if (!userRole) {
      throw new HttpError(500, "User role configuration missing");
    }

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
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new HttpError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        municipalityId: user.municipalityId || null,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return { token, user };
  }
};