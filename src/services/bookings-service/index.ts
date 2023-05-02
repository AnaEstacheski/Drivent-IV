import { notFoundError, forbiddenError } from '@/errors';
import bookingRepository from '@/repositories/bookings-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

async function findBookings(userId: number) {
  const booking = await bookingRepository.findBookings(userId);
  if (!booking) throw notFoundError();
  return booking;
}

async function checkIfRoomIsAvailable(roomId: number) {
  const room = await bookingRepository.findRoomById(roomId);
  if (room.Booking.length >= room.capacity) throw forbiddenError();
  if (!room) throw notFoundError();
}

async function postBooking(userId: number, roomId: number) {
  const data = await enrollmentRepository.findEnrollmentWithTicketByUserId(userId);
  if (!data || !data.Ticket[0]) throw forbiddenError();

  const ticket = data.Ticket[0];
  if (ticket.status !== 'PAID' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw forbiddenError();

  await checkIfRoomIsAvailable(roomId);

  const booking = await bookingRepository.createBooking(userId, roomId);
  return booking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.findBookings(userId);
  if (!booking) throw forbiddenError();
  if (booking.id !== bookingId) throw forbiddenError();

  await checkIfRoomIsAvailable(roomId);

  const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId);
  return updatedBooking;
}

const bookingsService = {
  findBookings,
  postBooking,
  updateBooking,
};

export default bookingsService;
