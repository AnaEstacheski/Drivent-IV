import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  try {
    const booking = await bookingService.findBookings(req.userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const roomId: number = req.body.roomId;
  try {
    const booking = await bookingService.postBooking(req.userId, roomId);
    return res.send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(error.message);
    if (error.name === 'ForbiddenError') return res.status(httpStatus.FORBIDDEN).send(error.message);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const bookingId = req.params.bookingId;
  const roomId: number = req.body.roomId;
  try {
    const bookingUpdate = await bookingService.updateBooking(req.userId, Number(bookingId), roomId);
    return res.status(httpStatus.OK).send({ bookingId: bookingUpdate.id });
  } catch (error) {
    if (error.name === 'NotFoundError') return res.status(httpStatus.NOT_FOUND).send(error.message);
    if (error.name === 'ForbiddenError') return res.status(httpStatus.FORBIDDEN).send(error.message);
  }
}
