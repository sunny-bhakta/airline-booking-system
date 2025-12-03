import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Flight, FlightStatus } from './entities/flight.entity';
import { Route } from './entities/route.entity';
import { Airport } from './entities/airport.entity';
import { Schedule } from './entities/schedule.entity';
import { Aircraft } from './entities/aircraft.entity';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { SearchFlightsDto } from './dto/search-flights.dto';

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Aircraft)
    private aircraftRepository: Repository<Aircraft>,
  ) {}

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    // Validate route exists
    const route = await this.routeRepository.findOne({
      where: { id: createFlightDto.routeId },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // Check for duplicate flight number on same date
    const existingFlight = await this.flightRepository.findOne({
      where: {
        flightNumber: createFlightDto.flightNumber,
        departureDate: new Date(createFlightDto.departureDate),
      },
    });

    if (existingFlight) {
      throw new BadRequestException(
        'Flight with this number already exists on this date',
      );
    }

    // Calculate scheduled times based on schedule and departure date
    const schedule = await this.scheduleRepository.findOne({
      where: { id: createFlightDto.scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const departureDate = new Date(createFlightDto.departureDate);
    const [hours, minutes] = schedule.departureTime.split(':').map(Number);
    const scheduledDepartureTime = new Date(departureDate);
    scheduledDepartureTime.setHours(hours, minutes, 0, 0);

    const scheduledArrivalTime = new Date(scheduledDepartureTime);
    scheduledArrivalTime.setMinutes(
      scheduledArrivalTime.getMinutes() + schedule.duration,
    );

    // Get aircraft to calculate available seats
    const aircraft = await this.aircraftRepository.findOne({
      where: { id: createFlightDto.aircraftId },
      relations: ['seatConfiguration'],
    });

    if (!aircraft) {
      throw new NotFoundException('Aircraft not found');
    }

    const totalSeats = aircraft.seatConfiguration.totalSeats;

    const flight = this.flightRepository.create({
      ...createFlightDto,
      departureDate,
      scheduledDepartureTime,
      scheduledArrivalTime,
      availableSeats: totalSeats,
      bookedSeats: 0,
      status: createFlightDto.status || FlightStatus.SCHEDULED,
    });

    return await this.flightRepository.save(flight);
  }

  async findAll(): Promise<Flight[]> {
    return await this.flightRepository.find({
      relations: [
        'route',
        'route.origin',
        'route.destination',
        'aircraft',
        'gate',
        'gate.terminal',
        'gate.terminal.airport',
      ],
      order: { scheduledDepartureTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Flight> {
    const flight = await this.flightRepository.findOne({
      where: { id },
      relations: [
        'route',
        'route.origin',
        'route.destination',
        'schedule',
        'aircraft',
        'aircraft.seatConfiguration',
        'gate',
        'gate.terminal',
        'gate.terminal.airport',
      ],
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    return flight;
  }

  async search(searchFlightsDto: SearchFlightsDto): Promise<{
    flights: Flight[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers = 1,
      status,
      page = 1,
      limit = 10,
    } = searchFlightsDto;

    // Find origin and destination airports
    const airports = await this.airportRepository
      .createQueryBuilder('airport')
      .where('airport.iataCode IN (:...codes)', { codes: [origin.toUpperCase(), destination.toUpperCase()] })
      .getMany();

    const originAirport = airports.find(a => a.iataCode.toUpperCase() === origin.toUpperCase());
    const destinationAirport = airports.find(a => a.iataCode.toUpperCase() === destination.toUpperCase());

    if (!originAirport || !destinationAirport) {
      throw new NotFoundException('Origin or destination airport not found');
    }

    // Find route
    const route = await this.routeRepository.findOne({
      where: {
        originId: originAirport.id,
        destinationId: destinationAirport.id,
        isActive: true,
      },
    });

    if (!route) {
      return { flights: [], total: 0, page, limit };
    }

    // Build query
    // Build a query to fetch flights for the selected route, departure date, and enough available seats.
    // - Joins the route, route's origin and destination airports, and aircraft for rich flight context.
    // - Only flights with matching route, on the right date, and with enough seats are considered.
    // - Orders by scheduled departure time (soonest first).
    const queryBuilder = this.flightRepository
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.route', 'route')                   // Join full route entity
      .leftJoinAndSelect('route.origin', 'origin')                  // Join origin airport of the route
      .leftJoinAndSelect('route.destination', 'destination')        // Join destination airport of the route
      .leftJoinAndSelect('flight.aircraft', 'aircraft')             // Join aircraft for this flight
      .leftJoinAndSelect('flight.gate', 'gate')                     // Join gate for this flight
      .leftJoinAndSelect('gate.terminal', 'terminal')               // Join terminal for the gate
      .leftJoinAndSelect('terminal.airport', 'gateAirport')         // Join airport for the terminal
      .where('flight.routeId = :routeId', { routeId: route.id })    // Only flights for the found route
      .andWhere('DATE(flight.departureDate) = :departureDate', {
        departureDate: departureDate.split('T')[0], // Filter by departure date only (format: YYYY-MM-DD)
      })
      .andWhere('flight.availableSeats >= :passengers', { passengers }) // Only flights with enough seats
      .orderBy('flight.scheduledDepartureTime', 'ASC');             // Soonest departures first

    if (status) {
      queryBuilder.andWhere('flight.status = :status', { status });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const flights = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { flights, total, page, limit };
  }

  async update(id: string, updateFlightDto: UpdateFlightDto): Promise<Flight> {
    const flight = await this.findOne(id);

    // Update available seats if booked seats changed
    if (updateFlightDto.bookedSeats !== undefined) {
      const aircraft = await this.aircraftRepository.findOne({
        where: { id: flight.aircraftId },
        relations: ['seatConfiguration'],
      });

      if (aircraft) {
        const totalSeats = aircraft.seatConfiguration.totalSeats;
        updateFlightDto.availableSeats = totalSeats - updateFlightDto.bookedSeats;

        if (updateFlightDto.availableSeats < 0) {
          throw new BadRequestException('Booked seats exceed total capacity');
        }
      }
    }

    // The following line copies all properties from updateFlightDto onto the existing flight object.
    // This updates the flight with the new values provided in the DTO.
    Object.assign(flight, updateFlightDto);

    // Update timestamps if actual times are provided
    if (updateFlightDto.actualDepartureTime) {
      flight.actualDepartureTime = new Date(updateFlightDto.actualDepartureTime);
    }

    if (updateFlightDto.actualArrivalTime) {
      flight.actualArrivalTime = new Date(updateFlightDto.actualArrivalTime);
    }

    return await this.flightRepository.save(flight);
  }

  async remove(id: string): Promise<void> {
    const flight = await this.findOne(id);

    // Don't allow deletion of flights that have bookings
    if (flight.bookedSeats > 0) {
      throw new BadRequestException(
        'Cannot delete flight with existing bookings',
      );
    }

    await this.flightRepository.remove(flight);
  }

  async updateStatus(
    id: string,
    status: FlightStatus,
  ): Promise<Flight> {
    const flight = await this.findOne(id);
    flight.status = status;
    return await this.flightRepository.save(flight);
  }

  async getFlightsByStatus(status: FlightStatus): Promise<Flight[]> {
    return await this.flightRepository.find({
      where: { status },
      relations: [
        'route',
        'route.origin',
        'route.destination',
        'gate',
        'gate.terminal',
        'gate.terminal.airport',
      ],
      order: { scheduledDepartureTime: 'ASC' },
    });
  }

  async getFlightsByDate(date: Date): Promise<Flight[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.flightRepository.find({
      where: {
        departureDate: Between(startOfDay, endOfDay),
      },
      relations: [
        'route',
        'route.origin',
        'route.destination',
        'gate',
        'gate.terminal',
        'gate.terminal.airport',
      ],
      order: { scheduledDepartureTime: 'ASC' },
    });
  }
}

