import { prisma } from '@/config';

async function findBookings(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: { userId, roomId },
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: { Booking: true },
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { roomId },
  });
}

const bookingRepository = {
  findBookings,
  createBooking,
  findRoomById,
  updateBooking,
};

export default bookingRepository;
