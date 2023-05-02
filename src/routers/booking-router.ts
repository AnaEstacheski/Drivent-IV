import { Router } from 'express';
import { getBookings, postBooking, updateBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', getBookings)
  .post('/', postBooking)
  .put('/:bookingId', updateBooking);

export { bookingRouter };
