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

/* export async function createBooking(req: AuthenticatedRequest, res: Response) {
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
} */
