import { adminService } from "./admin.service.js";

export async function getPendingBookings(req, res, next) {
  try {
    const bookings = await adminService.getPendingBookings(
      req.user
    );
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export async function getPendingResources(req, res, next) {
  try {
    // Delegates to resource service - proper separation of concerns
    const resources = await resourceService.findPendingApproval();
    res.json(resources);
  } catch (error) {
    next(error);
  }
}

