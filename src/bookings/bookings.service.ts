import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Passenger } from './entities/passenger.entity';
import { Ticket } from './entities/ticket.entity';
import { SeatAssignment } from './entities/seat-assignment.entity';
import { Flight } from '../flights/entities/flight.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateSeatAssignmentDto } from './dto/create-seat-assignment.dto';
import { SearchBookingsDto } from './dto/search-bookings.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(SeatAssignment)
    private seatAssignmentRepository: Repository<SeatAssignment>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
  ) {}

  /**
   * Generate a unique PNR (Passenger Name Record)
   * Format: 6 alphanumeric characters (e.g., ABC123)
   */
  private generatePNR(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  }

  /**
   * Generate a unique ticket number (13 digits as per IATA standard)
   */
  private generateTicketNumber(): string {
    // IATA ticket number format: 13 digits starting with airline code
    const prefix = '001'; // Airline code (example)
    const randomDigits = Math.floor(Math.random() * 10000000000)
      .toString()
      .padStart(10, '0');
    return prefix + randomDigits;
  }

  /**
   * Check if PNR already exists
   */
  private async isPNRUnique(pnr: string): Promise<boolean> {
    const existing = await this.bookingRepository.findOne({
      where: { pnr },
    });
    return !existing;
  }

  /**
   * Create a new booking
   */
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Validate flight exists and has available seats
    const flight = await this.flightRepository.findOne({
      where: { id: createBookingDto.flightId },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const numberOfPassengers = createBookingDto.passengers.length;

    if (flight.availableSeats < numberOfPassengers) {
      throw new BadRequestException(
        `Not enough available seats. Available: ${flight.availableSeats}, Required: ${numberOfPassengers}`,
      );
    }

    // Generate unique PNR
    let pnr: string;
    let attempts = 0;
    do {
      pnr = this.generatePNR();
      attempts++;
      if (attempts > 10) {
        throw new ConflictException('Failed to generate unique PNR');
      }
    } while (!(await this.isPNRUnique(pnr)));

    // Create booking
    const booking = this.bookingRepository.create({
      pnr,
      flightId: createBookingDto.flightId,
      status: BookingStatus.PENDING,
      totalAmount: createBookingDto.totalAmount,
      currency: createBookingDto.currency || 'USD',
      notes: createBookingDto.notes,
      bookingDate: new Date(),
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Create passengers
    const passengers = createBookingDto.passengers.map((passengerDto) =>
      this.passengerRepository.create({
        ...passengerDto,
        dateOfBirth: new Date(passengerDto.dateOfBirth),
        passportExpiryDate: passengerDto.passportExpiryDate
          ? new Date(passengerDto.passportExpiryDate)
          : null,
        bookingId: savedBooking.id,
      }),
    );

    const savedPassengers = await this.passengerRepository.save(passengers);

    // Update flight booked seats
    flight.bookedSeats += numberOfPassengers;
    flight.availableSeats -= numberOfPassengers;
    await this.flightRepository.save(flight);

    // Load booking with relations
    return await this.findOne(savedBooking.id);
  }

  /**
   * Find all bookings
   */
  async findAll(): Promise<Booking[]> {
    return await this.bookingRepository.find({
      relations: [
        'flight',
        'flight.route',
        'flight.route.origin',
        'flight.route.destination',
        'passengers',
        'tickets',
        'seatAssignments',
      ],
      order: { bookingDate: 'DESC' },
    });
  }

  /**
   * Find booking by ID
   */
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'flight',
        'flight.route',
        'flight.route.origin',
        'flight.route.destination',
        'flight.aircraft',
        'passengers',
        'tickets',
        'seatAssignments',
        'seatAssignments.passenger',
      ],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  /**
   * Find booking by PNR
   */
  async findByPNR(pnr: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { pnr: pnr.toUpperCase() },
      relations: [
        'flight',
        'flight.route',
        'flight.route.origin',
        'flight.route.destination',
        'flight.aircraft',
        'passengers',
        'tickets',
        'seatAssignments',
        'seatAssignments.passenger',
      ],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with PNR ${pnr} not found`);
    }

    return booking;
  }

  /**
   * Search bookings with filters
   */
  async search(searchBookingsDto: SearchBookingsDto): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      pnr,
      flightId,
      status,
      bookingDateFrom,
      bookingDateTo,
      page = 1,
      limit = 10,
    } = searchBookingsDto;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.flight', 'flight')
      .leftJoinAndSelect('flight.route', 'route')
      .leftJoinAndSelect('route.origin', 'origin')
      .leftJoinAndSelect('route.destination', 'destination')
      .leftJoinAndSelect('booking.passengers', 'passengers')
      .leftJoinAndSelect('booking.tickets', 'tickets')
      .leftJoinAndSelect('booking.seatAssignments', 'seatAssignments');

    if (pnr) {
      queryBuilder.andWhere('booking.pnr = :pnr', { pnr: pnr.toUpperCase() });
    }

    if (flightId) {
      queryBuilder.andWhere('booking.flightId = :flightId', { flightId });
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (bookingDateFrom && bookingDateTo) {
      queryBuilder.andWhere('booking.bookingDate BETWEEN :from AND :to', {
        from: new Date(bookingDateFrom),
        to: new Date(bookingDateTo),
      });
    } else if (bookingDateFrom) {
      queryBuilder.andWhere('booking.bookingDate >= :from', {
        from: new Date(bookingDateFrom),
      });
    } else if (bookingDateTo) {
      queryBuilder.andWhere('booking.bookingDate <= :to', {
        to: new Date(bookingDateTo),
      });
    }

    queryBuilder.orderBy('booking.bookingDate', 'DESC');

    const total = await queryBuilder.getCount();

    const bookings = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { bookings, total, page, limit };
  }

  /**
   * Update booking
   */
  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

    if (updateBookingDto.status) {
      // Handle status transitions
      if (updateBookingDto.status === BookingStatus.CONFIRMED) {
        booking.confirmationDate = new Date();
        // Generate tickets when booking is confirmed
        if (booking.tickets.length === 0) {
          await this.generateTickets(booking.id);
        }
      } else if (updateBookingDto.status === BookingStatus.CANCELLED) {
        booking.cancellationDate = new Date();
        booking.cancellationReason = updateBookingDto.cancellationReason;
        // Release seats back to flight
        const flight = await this.flightRepository.findOne({
          where: { id: booking.flightId },
        });
        if (flight) {
          flight.bookedSeats -= booking.passengers.length;
          flight.availableSeats += booking.passengers.length;
          await this.flightRepository.save(flight);
        }
      }
    }

    Object.assign(booking, updateBookingDto);

    return await this.bookingRepository.save(booking);
  }

  /**
   * Delete booking
   */
  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException(
        'Cannot delete confirmed booking. Please cancel it first.',
      );
    }

    // Release seats
    const flight = await this.flightRepository.findOne({
      where: { id: booking.flightId },
    });

    if (flight) {
      flight.bookedSeats -= booking.passengers.length;
      flight.availableSeats += booking.passengers.length;
      await this.flightRepository.save(flight);
    }

    await this.bookingRepository.remove(booking);
  }

  /**
   * Generate tickets for a booking
   */
  async generateTickets(bookingId: string): Promise<Ticket[]> {
    const booking = await this.findOne(bookingId);

    if (booking.tickets.length > 0) {
      throw new BadRequestException('Tickets already generated for this booking');
    }

    const tickets: Ticket[] = [];
    const farePerPassenger = booking.totalAmount / booking.passengers.length;
    const taxesPerPassenger = farePerPassenger * 0.1; // Example: 10% tax
    const feesPerPassenger = farePerPassenger * 0.05; // Example: 5% fees

    for (const passenger of booking.passengers) {
      let ticketNumber: string;
      let attempts = 0;
      do {
        ticketNumber = this.generateTicketNumber();
        attempts++;
        if (attempts > 10) {
          throw new ConflictException('Failed to generate unique ticket number');
        }
      } while (
        await this.ticketRepository.findOne({ where: { ticketNumber } })
      );

      const ticket = this.ticketRepository.create({
        ticketNumber,
        bookingId: booking.id,
        passengerId: passenger.id,
        fare: farePerPassenger,
        taxes: taxesPerPassenger,
        fees: feesPerPassenger,
        fareClass: 'Economy', // Default, can be customized
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: true,
      });

      tickets.push(ticket);
    }

    return await this.ticketRepository.save(tickets);
  }

  /**
   * Assign seat to a passenger
   */
  async assignSeat(
    bookingId: string,
    createSeatAssignmentDto: CreateSeatAssignmentDto,
  ): Promise<SeatAssignment> {
    const booking = await this.findOne(bookingId);

    // Verify passenger belongs to this booking
    const passenger = booking.passengers.find(
      (p) => p.id === createSeatAssignmentDto.passengerId,
    );

    if (!passenger) {
      throw new NotFoundException(
        'Passenger not found in this booking',
      );
    }

    // Check if seat is already assigned
    const existingAssignment = await this.seatAssignmentRepository.findOne({
      where: {
        bookingId,
        seatNumber: createSeatAssignmentDto.seatNumber,
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        `Seat ${createSeatAssignmentDto.seatNumber} is already assigned`,
      );
    }

    // Check if passenger already has a seat assigned
    const existingPassengerSeat = await this.seatAssignmentRepository.findOne({
      where: {
        bookingId,
        passengerId: createSeatAssignmentDto.passengerId,
      },
    });

    if (existingPassengerSeat) {
      throw new BadRequestException(
        'Passenger already has a seat assigned. Please update the existing assignment.',
      );
    }

    const seatAssignment = this.seatAssignmentRepository.create({
      ...createSeatAssignmentDto,
      bookingId,
      assignedDate: new Date(),
    });

    return await this.seatAssignmentRepository.save(seatAssignment);
  }

  /**
   * Get seat assignments for a booking
   */
  async getSeatAssignments(bookingId: string): Promise<SeatAssignment[]> {
    await this.findOne(bookingId); // Verify booking exists

    return await this.seatAssignmentRepository.find({
      where: { bookingId },
      relations: ['passenger'],
      order: { seatNumber: 'ASC' },
    });
  }

  /**
   * Remove seat assignment
   */
  async removeSeatAssignment(
    bookingId: string,
    seatAssignmentId: string,
  ): Promise<void> {
    const seatAssignment = await this.seatAssignmentRepository.findOne({
      where: { id: seatAssignmentId, bookingId },
    });

    if (!seatAssignment) {
      throw new NotFoundException('Seat assignment not found');
    }

    await this.seatAssignmentRepository.remove(seatAssignment);
  }

  /**
   * Update booking status
   */
  async updateStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    if (status === BookingStatus.CONFIRMED) {
      booking.status = status;
      booking.confirmationDate = new Date();
      // Generate tickets when booking is confirmed
      if (booking.tickets.length === 0) {
        await this.generateTickets(booking.id);
      }
    } else if (status === BookingStatus.CANCELLED) {
      booking.status = status;
      booking.cancellationDate = new Date();
      booking.cancellationReason = cancellationReason;
      // Release seats back to flight
      const flight = await this.flightRepository.findOne({
        where: { id: booking.flightId },
      });
      if (flight) {
        flight.bookedSeats -= booking.passengers.length;
        flight.availableSeats += booking.passengers.length;
        await this.flightRepository.save(flight);
      }
    } else if (status === BookingStatus.CHECKED_IN) {
      booking.status = status;
    } else {
      booking.status = status;
    }

    return await this.bookingRepository.save(booking);
  }

  /**
   * Get bookings by status
   */
  async getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { status },
      relations: [
        'flight',
        'flight.route',
        'flight.route.origin',
        'flight.route.destination',
        'passengers',
        'tickets',
        'seatAssignments',
      ],
      order: { bookingDate: 'DESC' },
    });
  }
}