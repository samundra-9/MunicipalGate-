// backend/src/modules/auth/auth.controller.js
import { authService } from "./auth.service.js";

export async function register(req, res, next) {
  try {
    const { name, email, password, municipalityId } = req.body;
    const user = await authService.register({ 
      name, 
      email, 
      password,
      municipalityId: municipalityId ? Number(municipalityId) : null 
    });
    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      role: user.role.name 
    });
  } catch (error) {
    next(error);
  }
}