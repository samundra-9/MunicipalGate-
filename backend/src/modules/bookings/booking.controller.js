import { bookingService } from "./booking.service.js";

export async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBooking(
      req.user,
      req.body
    );
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export async function approveBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);

    const result = await bookingService.approveBooking(
      req.user,
      bookingId
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export async function rejectBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const { reason } = req.body;

    const result = await bookingService.rejectBooking(
      req.user,
      bookingId,
      reason
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export async function createSlotBooking(req, res, next) {
  try {
    const { slotId } = req.body;

    const booking = await bookingService.createSlotBooking(
      req.user,
      slotId
    );

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}



