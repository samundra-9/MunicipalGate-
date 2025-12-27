import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { HttpError } from "../../utils/httpError.js";

export const authService = {
  async login({ email, password }) {
    if (!email || !password) {
      throw new HttpError(400, "Email and password required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true
      }
    });

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new HttpError(403, "User is suspended");
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      throw new HttpError(401, "Invalid credentials");
    }

    // JWT payload (VERY IMPORTANT)
    const payload = {
      id: user.id,
      role: user.role.name,
      municipalityId: user.municipalityId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h"
    });

    return token;
  }
};
