import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/bookings-repository';

async function findBookings(userId: number) {
  const booking = await bookingRepository.findBookings(userId);
  if (!booking) throw notFoundError();
  return booking;
}

/* async function createBooking() {
}

async function updateBooking() {
} */

const bookingsService = {
  findBookings,
  /*   createBooking,
  updateBooking, */
};

export default bookingsService;
