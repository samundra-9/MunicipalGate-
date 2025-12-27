import { authService } from "./auth.service.js";

export async function login(req, res, next) {
    console.log("LOGIN ROUTE HIT");

  try {
    const token = await authService.login(req.body);
    res.json({ token });
  } catch (error) {
    next(error);
  }
}
