import { Router } from 'express';
import {} from '@/controllers';
import { authenticateToken } from '@/middlewares';

const bookingsRouter = Router();

bookingsRouter.all('/*', authenticateToken).get('/').post('/').put('/:bookingId');

export { bookingsRouter };
