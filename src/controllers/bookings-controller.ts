import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingsService from '@/services/bookings-service';

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const booking = await bookingsService.findBookings(req.userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const roomId: number = req.body.roomId;
  try {
    const booking = await bookingsService.postBooking(req.userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(error.message);
    if (error.name === 'ForbiddenError') return res.status(httpStatus.FORBIDDEN).send(error.message);
  }
}

/* export async function updateBooking(req: AuthenticatedRequest, res: Response) {
} */
