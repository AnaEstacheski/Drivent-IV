import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createUser,
  createHotel,
  createRoomWithHotelId,
  createBooking,
  createEnrollmentWithAddress,
  createTicket,
  createCustomizedTicketType,
} from '../factories';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have a booking yet', async () => {
      const token = await generateValidToken();

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and booking data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when user doesnt have an enrollment or ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: 1 };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const body = { roomId: 1 };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const body = { roomId: 1 };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if ticket type doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const body = { roomId: 1 };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 if room does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const body = { roomId: 1 };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if room is at capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id);
      await createBooking(user.id, room.id);
      const body = { roomId: room.id };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id);
      const body = { roomId: room.id };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });

    it('should insert a new booking in the database', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createCustomizedTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const createdHotel = await createHotel();
      const room = await createRoomWithHotelId(createdHotel.id);
      const body = { roomId: room.id };

      const beforeCount = await prisma.booking.count();

      await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      const afterCount = await prisma.booking.count();

      expect(beforeCount).toEqual(0);
      expect(afterCount).toEqual(1);
    });
  });
});

describe('PUT/booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 403 when user doesnt have a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { roomId: 2 };

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if booking doesnt belong to user', async () => {
      const firstUser = await createUser();
      const secondUser = await createUser();
      const tokenSecondUser = await generateValidToken(secondUser);

      const hotel = await createHotel();
      const firstRoom = await createRoomWithHotelId(hotel.id);
      const secondRoom = await createRoomWithHotelId(hotel.id);

      const bookingFirstUser = await createBooking(firstUser.id, firstRoom.id);
      await createBooking(secondUser.id, secondRoom.id);

      const body = { roomId: firstRoom.id };

      const response = await server
        .put(`/booking/${bookingFirstUser.id}`)
        .set('Authorization', `Bearer ${tokenSecondUser}`)
        .send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 404 if chosen room does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const body = { roomId: 50 };

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if new room is at capacity', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const body = { roomId: room.id };

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const firstRoom = await createRoomWithHotelId(hotel.id);
      const secondRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, firstRoom.id);
      const body = { roomId: secondRoom.id };

      const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});
