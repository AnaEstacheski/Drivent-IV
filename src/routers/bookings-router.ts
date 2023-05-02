import { Router } from 'express';
import { getBookings, postBooking } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingsRouter = Router();

bookingsRouter.all('/*', authenticateToken).get('/', getBookings).post('/', postBooking).put('/:bookingId');

export { bookingsRouter };
