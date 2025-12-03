import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Passenger } from './entities/passenger.entity';
import { Ticket } from './entities/ticket.entity';
import { SeatAssignment } from './entities/seat-assignment.entity';
import { Flight } from '../flights/entities/flight.entity';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateSeatAssignmentDto } from './dto/create-seat-assignment.dto';
import { SearchBookingsDto } from './dto/search-bookings.dto';
import { PaymentsService } from '../payments/payments.service';
import { AncillaryService } from '../ancillary/ancillary.service';

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private ancillaryService: AncillaryService,
  ) {}

  /**
   * Generate a unique PNR (Passenger Name Record)
   * 
   * PNR is a 6-character alphanumeric code used as the booking reference.
   * Format: 6 alphanumeric characters (e.g., ABC123, XY9Z2K)
   * Character set: A-Z and 0-9
   * 
   * @returns Random 6-character PNR string
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
   * 
   * IATA ticket number format: 13 digits
   * Format: [Airline Code (3 digits)][Random 10 digits]
   * Example: 0011234567890
   * 
   * @returns 13-digit ticket number string
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
   * Check if PNR already exists in the database
   * 
   * Used during PNR generation to ensure uniqueness.
   * 
   * @param pnr - PNR string to check
   * @returns true if PNR is unique (doesn't exist), false otherwise
   */
  private async isPNRUnique(pnr: string): Promise<boolean> {
    const existing = await this.bookingRepository.findOne({
      where: { pnr },
    });
    return !existing;
  }

  /**
   * Create a new booking
   * 
   * This is the core booking creation method that implements the booking flow:
   * 1. Validates flight exists and has sufficient available seats
   * 2. Generates a unique PNR (Passenger Name Record)
   * 3. Validates user if provided (allows guest bookings)
   * 4. Creates booking record with PENDING status
   * 5. Creates passenger records linked to the booking
   * 6. Updates flight inventory (decrements available seats)
   * 7. Returns complete booking with all relations loaded
   * 
   * @param createBookingDto - Booking creation data including flight, passengers, and amount
   * @returns Complete booking object with all relations (flight, passengers, etc.)
   * @throws NotFoundException if flight or user not found
   * @throws BadRequestException if insufficient seats available
   * @throws ConflictException if PNR generation fails after 10 attempts
   */
  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Step 1: Validate flight exists and has available seats
    const flight = await this.flightRepository.findOne({
      where: { id: createBookingDto.flightId },
    });

    if (!flight) {
      throw new NotFoundException('Flight not found');
    }

    const numberOfPassengers = createBookingDto.passengers.length;

    // Check seat availability before proceeding
    if (flight.availableSeats < numberOfPassengers) {
      throw new BadRequestException(
        `Not enough available seats. Available: ${flight.availableSeats}, Required: ${numberOfPassengers}`,
      );
    }

    // Step 2: Generate unique PNR (Passenger Name Record)
    // PNR is a 6-character alphanumeric code used as booking reference
    // Retry up to 10 times to ensure uniqueness
    let pnr: string;
    let attempts = 0;
    do {
      pnr = this.generatePNR();
      attempts++;
      if (attempts > 10) {
        throw new ConflictException('Failed to generate unique PNR');
      }
    } while (!(await this.isPNRUnique(pnr)));

    // Step 3: Validate user if provided (optional - supports guest bookings)
    if (createBookingDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: createBookingDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Step 4: Create booking record with PENDING status
    // Status will be updated to CONFIRMED after payment processing
    const booking = this.bookingRepository.create({
      pnr,
      flightId: createBookingDto.flightId,
      userId: createBookingDto.userId || null,
      status: BookingStatus.PENDING,
      totalAmount: createBookingDto.totalAmount,
      currency: createBookingDto.currency || 'USD',
      notes: createBookingDto.notes,
      bookingDate: new Date(),
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Step 5: Create passenger records
    // Convert date strings to Date objects and link to booking
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

    // Step 6: Update flight inventory
    // Decrement available seats and increment booked seats
    flight.bookedSeats += numberOfPassengers;
    flight.availableSeats -= numberOfPassengers;
    await this.flightRepository.save(flight);

    // Step 7: Return complete booking with all relations loaded
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
        'user',
        'user.profile',
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
        'user',
        'user.profile',
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
   * Find booking by PNR (Passenger Name Record)
   * 
   * This is the primary method for customers to retrieve their booking
   * using the 6-character PNR code provided at booking creation.
   * 
   * @param pnr - 6-character PNR code (case-insensitive)
   * @returns Complete booking object with all relations
   * @throws NotFoundException if booking with PNR not found
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
        'user',
        'user.profile',
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
      userId,
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
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('booking.passengers', 'passengers')
      .leftJoinAndSelect('booking.tickets', 'tickets')
      .leftJoinAndSelect('booking.seatAssignments', 'seatAssignments');

    if (pnr) {
      queryBuilder.andWhere('booking.pnr = :pnr', { pnr: pnr.toUpperCase() });
    }

    if (userId) {
      queryBuilder.andWhere('booking.userId = :userId', { userId });
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
   * 
   * Creates one ticket per passenger in the booking. Tickets are generated
   * automatically when a booking status changes to CONFIRMED.
   * 
   * Ticket details:
   * - Unique 13-digit ticket number (IATA standard format)
   * - Fare breakdown: base fare, taxes (10%), fees (5%)
   * - Default fare class: Economy
   * - Validity: 1 year from issue date
   * 
   * @param bookingId - Booking UUID
   * @returns Array of generated ticket objects
   * @throws NotFoundException if booking not found
   * @throws BadRequestException if tickets already exist for this booking
   * @throws ConflictException if ticket number generation fails after 10 attempts
   */
  async generateTickets(bookingId: string): Promise<Ticket[]> {
    const booking = await this.findOne(bookingId);

    // Prevent duplicate ticket generation
    if (booking.tickets.length > 0) {
      throw new BadRequestException('Tickets already generated for this booking');
    }

    const tickets: Ticket[] = [];
    
    // Calculate fare breakdown per passenger
    // Total amount is divided equally among passengers
    const farePerPassenger = booking.totalAmount / booking.passengers.length;
    const taxesPerPassenger = farePerPassenger * 0.1; // Example: 10% tax
    const feesPerPassenger = farePerPassenger * 0.05; // Example: 5% fees

    // Generate one ticket per passenger
    for (const passenger of booking.passengers) {
      // Generate unique ticket number (IATA standard: 13 digits)
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

      // Create ticket record
      const ticket = this.ticketRepository.create({
        ticketNumber,
        bookingId: booking.id,
        passengerId: passenger.id,
        fare: farePerPassenger,
        taxes: taxesPerPassenger,
        fees: feesPerPassenger,
        fareClass: 'Economy', // Default, can be customized based on fare class selection
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
   * 
   * Assigns a specific seat to a passenger within a booking. This can be
   * done at any time after booking creation, including after confirmation.
   * 
   * Business rules:
   * - Passenger must belong to the booking
   * - Seat number must be unique within the booking (no double-booking)
   * - Each passenger can have only one seat assignment
   * 
   * @param bookingId - Booking UUID
   * @param createSeatAssignmentDto - Seat assignment data (passengerId, seatNumber, etc.)
   * @returns Created seat assignment object
   * @throws NotFoundException if booking or passenger not found
   * @throws ConflictException if seat is already assigned to another passenger
   * @throws BadRequestException if passenger already has a seat assigned
   */
  async assignSeat(
    bookingId: string,
    createSeatAssignmentDto: CreateSeatAssignmentDto,
  ): Promise<SeatAssignment> {
    const booking = await this.findOne(bookingId);

    // Verify passenger belongs to this booking
    // Prevents assigning seats to passengers from other bookings
    const passenger = booking.passengers.find(
      (p) => p.id === createSeatAssignmentDto.passengerId,
    );

    if (!passenger) {
      throw new NotFoundException(
        'Passenger not found in this booking',
      );
    }

    // Check if seat is already assigned to another passenger
    // Prevents double-booking of the same seat
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
    // Each passenger can have only one seat per booking
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

    // Create seat assignment
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
   * 
   * Manages status transitions in the booking lifecycle:
   * - PENDING → CONFIRMED: Sets confirmation date and generates tickets
   * - Any → CANCELLED: Sets cancellation date, stores reason, and releases seats
   * - Any → CHECKED_IN: Marks booking as checked in
   * 
   * Status transitions trigger automatic actions:
   * - CONFIRMED: Automatically generates tickets if not already generated
   * - CANCELLED: Releases seats back to flight inventory
   * 
   * @param id - Booking UUID
   * @param status - New booking status
   * @param cancellationReason - Required when status is CANCELLED
   * @returns Updated booking object
   * @throws NotFoundException if booking not found
   */
  async updateStatus(
    id: string,
    status: BookingStatus,
    cancellationReason?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    if (status === BookingStatus.CONFIRMED) {
      // Check if booking has payment (recommended but not enforced)
      // Payment service automatically confirms booking, so manual confirmation
      // should typically only be used for special cases (e.g., admin override)
      const hasPayment = await this.hasPayment(id);
      if (!hasPayment) {
        // Log warning but allow confirmation (for admin overrides, free bookings, etc.)
        console.warn(
          `Warning: Confirming booking ${id} without completed payment. This should typically be done through payment processing.`,
        );
      }

      booking.status = status;
      booking.confirmationDate = new Date();
      // Automatically generate tickets when booking is confirmed
      // Tickets are required for confirmed bookings
      if (booking.tickets.length === 0) {
        await this.generateTickets(booking.id);
      }
    } else if (status === BookingStatus.CANCELLED) {
      booking.status = status;
      booking.cancellationDate = new Date();
      booking.cancellationReason = cancellationReason;
      // Release seats back to flight inventory
      // This allows the seats to be available for other bookings
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
        'user',
        'user.profile',
        'passengers',
        'tickets',
        'seatAssignments',
      ],
      order: { bookingDate: 'DESC' },
    });
  }

  /**
   * Get bookings by user ID
   */
  async findByUserId(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { userId },
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
   * Get payment information for a booking
   * 
   * Returns payment transactions, invoices, and receipts for the booking.
   * 
   * @param bookingId - Booking UUID
   * @returns Payment information including transactions, invoices, and receipts
   * @throws NotFoundException if booking not found
   */
  async getPaymentInfo(bookingId: string): Promise<{
    booking: Booking;
    transactions: any[];
    invoices: any[];
    receipts: any[];
  }> {
    const booking = await this.findOne(bookingId);

    // Get payment transactions
    const transactionsResult = await this.paymentsService.search({
      bookingId,
      page: 1,
      limit: 100,
    });

    // Get invoices
    const invoices = await this.paymentsService.getInvoicesByBooking(bookingId);

    // Get receipts
    const receipts = await this.paymentsService.getReceiptsByBooking(bookingId);

    return {
      booking,
      transactions: transactionsResult.transactions,
      invoices,
      receipts,
    };
  }

  /**
   * Check if booking has payment
   * 
   * Validates if a booking has a completed payment transaction.
   * Useful before manually confirming a booking.
   * 
   * @param bookingId - Booking UUID
   * @returns true if booking has completed payment, false otherwise
   */
  async hasPayment(bookingId: string): Promise<boolean> {
    try {
      const transactionsResult = await this.paymentsService.search({
        bookingId,
        status: 'completed' as any,
        page: 1,
        limit: 1,
      });
      return transactionsResult.transactions.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all ancillary services for a booking
   * 
   * Returns baggage, in-flight services, travel insurance, and totals
   * 
   * @param bookingId - Booking UUID
   * @returns All ancillary services with totals
   * @throws NotFoundException if booking not found
   */
  async getAncillaryServices(bookingId: string) {
    await this.findOne(bookingId); // Validate booking exists
    return this.ancillaryService.getAllAncillaryServicesByBooking(bookingId);
  }

  /**
   * Get baggage for a booking
   * 
   * @param bookingId - Booking UUID
   * @returns List of baggage items
   * @throws NotFoundException if booking not found
   */
  async getBaggage(bookingId: string) {
    await this.findOne(bookingId); // Validate booking exists
    return this.ancillaryService.getBaggageByBooking(bookingId);
  }

  /**
   * Get in-flight services for a booking
   * 
   * @param bookingId - Booking UUID
   * @returns List of in-flight services
   * @throws NotFoundException if booking not found
   */
  async getInFlightServices(bookingId: string) {
    await this.findOne(bookingId); // Validate booking exists
    return this.ancillaryService.getInFlightServicesByBooking(bookingId);
  }

  /**
   * Get travel insurance for a booking
   * 
   * @param bookingId - Booking UUID
   * @returns List of travel insurance policies
   * @throws NotFoundException if booking not found
   */
  async getTravelInsurance(bookingId: string) {
    await this.findOne(bookingId); // Validate booking exists
    return this.ancillaryService.getTravelInsuranceByBooking(bookingId);
  }
}