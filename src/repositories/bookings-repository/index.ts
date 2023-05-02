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

// async function createBooking() {}

// async function updateBooking() {}

const bookingRepository = {
  findBookings,
  /*   createBooking,
  updateBooking, */
};

export default bookingRepository;
