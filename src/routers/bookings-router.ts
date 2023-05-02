import { Router } from 'express';
import { getBookings, postBooking, updateBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingsRouter = Router();

bookingsRouter
  .all('/*', authenticateToken)
  .get('/', getBookings)
  .post('/', postBooking)
  .put('/:bookingId', updateBooking);

export { bookingsRouter };
