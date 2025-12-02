import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Flight, FlightStatus } from '../entities/flight.entity';
import { Route } from '../entities/route.entity';
import { Airport } from '../entities/airport.entity';
import { Fare, FareClass } from '../../pricing/entities/fare.entity';
import { AdvancedSearchFlightsDto, TripType, StopsFilter, MultiCitySegment } from '../dto/advanced-search-flights.dto';
import { CheckAvailabilityDto, AvailabilityResult } from '../dto/check-availability.dto';

export interface SearchResult {
  flights: Flight[];
  returnFlights?: Flight[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

@Injectable()
export class SearchAvailabilityService {
  constructor(
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
    @InjectRepository(Fare)
    private fareRepository: Repository<Fare>,
  ) {}

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find nearby airports within a specified radius
   */
  async findNearbyAirports(
    airportIataCode: string,
    radiusKm: number,
  ): Promise<Airport[]> {
    const airport = await this.airportRepository.findOne({
      where: { iataCode: airportIataCode.toUpperCase() },
    });

    if (!airport || !airport.latitude || !airport.longitude) {
      return [];
    }

    const allAirports = await this.airportRepository.find();

    return allAirports.filter((a) => {
      if (!a.latitude || !a.longitude || a.iataCode === airport.iataCode) {
        return false;
      }
      const distance = this.calculateDistance(
        airport.latitude,
        airport.longitude,
        a.latitude,
        a.longitude,
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Get all airports for search (including nearby if requested)
   */
  private async getSearchAirports(
    iataCode: string,
    includeNearby: boolean,
    radiusKm: number,
  ): Promise<Airport[]> {
    const airport = await this.airportRepository.findOne({
      where: { iataCode: iataCode.toUpperCase() },
    });

    if (!airport) {
      throw new NotFoundException(`Airport with IATA code ${iataCode} not found`);
    }

    const airports = [airport];

    if (includeNearby) {
      const nearby = await this.findNearbyAirports(iataCode, radiusKm);
      airports.push(...nearby);
    }

    return airports;
  }

  /**
   * Find routes between origin and destination airports (including nearby)
   */
  private async findRoutes(
    originAirports: Airport[],
    destinationAirports: Airport[],
  ): Promise<Route[]> {
    const originIds = originAirports.map((a) => a.id);
    const destinationIds = destinationAirports.map((a) => a.id);

    return await this.routeRepository.find({
      where: {
        originId: In(originIds),
        destinationId: In(destinationIds),
        isActive: true,
      },
      relations: ['origin', 'destination'],
    });
  }

  /**
   * Build base query for flight search
   */
  private buildBaseQuery() {
    return this.flightRepository
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.route', 'route')
      .leftJoinAndSelect('route.origin', 'origin')
      .leftJoinAndSelect('route.destination', 'destination')
      .leftJoinAndSelect('flight.aircraft', 'aircraft')
      .leftJoinAndSelect('flight.schedule', 'schedule')
      .leftJoinAndSelect('flight.gate', 'gate')
      .leftJoinAndSelect('gate.terminal', 'terminal')
      .leftJoinAndSelect('terminal.airport', 'gateAirport');
  }

  /**
   * Apply filters to query
   */
  private applyFilters(
    queryBuilder: any,
    searchDto: AdvancedSearchFlightsDto,
    routeIds: string[],
  ) {
    const {
      departureDate,
      departureDateFrom,
      departureDateTo,
      passengers = 1,
      status,
      departureTimeFrom,
      departureTimeTo,
      arrivalTimeFrom,
      arrivalTimeTo,
      maxDuration,
      aircraftModel,
      aircraftManufacturer,
      minPrice,
      maxPrice,
      fareClass,
    } = searchDto;

    // Route filter
    if (routeIds.length > 0) {
      queryBuilder.andWhere('flight.routeId IN (:...routeIds)', { routeIds });
    } else {
      // No routes found, return empty result
      queryBuilder.andWhere('1 = 0');
      return;
    }

    // Date filters
    if (departureDate) {
      queryBuilder.andWhere('DATE(flight.departureDate) = :departureDate', {
        departureDate: departureDate.split('T')[0],
      });
    } else if (departureDateFrom || departureDateTo) {
      if (departureDateFrom) {
        queryBuilder.andWhere('DATE(flight.departureDate) >= :departureDateFrom', {
          departureDateFrom: departureDateFrom.split('T')[0],
        });
      }
      if (departureDateTo) {
        queryBuilder.andWhere('DATE(flight.departureDate) <= :departureDateTo', {
          departureDateTo: departureDateTo.split('T')[0],
        });
      }
    }

    // Availability filter
    queryBuilder.andWhere('flight.availableSeats >= :passengers', { passengers });

    // Status filter
    if (status) {
      queryBuilder.andWhere('flight.status = :status', { status });
    } else {
      // Exclude cancelled flights by default
      queryBuilder.andWhere('flight.status != :cancelledStatus', {
        cancelledStatus: FlightStatus.CANCELLED,
      });
    }

    // Time filters
    if (departureTimeFrom) {
      queryBuilder.andWhere('TIME(flight.scheduledDepartureTime) >= :departureTimeFrom', {
        departureTimeFrom,
      });
    }
    if (departureTimeTo) {
      queryBuilder.andWhere('TIME(flight.scheduledDepartureTime) <= :departureTimeTo', {
        departureTimeTo,
      });
    }
    if (arrivalTimeFrom) {
      queryBuilder.andWhere('TIME(flight.scheduledArrivalTime) >= :arrivalTimeFrom', {
        arrivalTimeFrom,
      });
    }
    if (arrivalTimeTo) {
      queryBuilder.andWhere('TIME(flight.scheduledArrivalTime) <= :arrivalTimeTo', {
        arrivalTimeTo,
      });
    }

    // Duration filter
    if (maxDuration) {
      queryBuilder.andWhere('schedule.duration <= :maxDuration', { maxDuration });
    }

    // Aircraft filters
    if (aircraftModel) {
      queryBuilder.andWhere('aircraft.model LIKE :aircraftModel', {
        aircraftModel: `%${aircraftModel}%`,
      });
    }
    if (aircraftManufacturer) {
      queryBuilder.andWhere('aircraft.manufacturer = :aircraftManufacturer', {
        aircraftManufacturer,
      });
    }
  }

  /**
   * Apply price filters (requires subquery with fares)
   */
  private async applyPriceFilters(
    queryBuilder: any,
    minPrice?: number,
    maxPrice?: number,
    fareClass?: FareClass,
  ) {
    if (minPrice !== undefined || maxPrice !== undefined || fareClass) {
      // Get flight IDs that match price criteria
      const fareQuery = this.fareRepository
        .createQueryBuilder('fare')
        .select('fare.flightId')
        .where('fare.isActive = :isActive', { isActive: true });

      if (fareClass) {
        fareQuery.andWhere('fare.fareClass = :fareClass', { fareClass });
      }

      if (minPrice !== undefined) {
        fareQuery.andWhere('fare.totalFare >= :minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        fareQuery.andWhere('fare.totalFare <= :maxPrice', { maxPrice });
      }

      const matchingFlightIds = await fareQuery.getRawMany();
      const flightIds = matchingFlightIds.map((f) => f.fare_flightId);

      if (flightIds.length === 0) {
        queryBuilder.andWhere('1 = 0'); // No flights match price criteria
        return;
      }

      queryBuilder.andWhere('flight.id IN (:...flightIds)', { flightIds });
    }
  }

  /**
   * Apply sorting
   */
  private applySorting(
    queryBuilder: any,
    sortBy: string,
    sortOrder: string,
  ) {
    switch (sortBy) {
      case 'price':
        // For price sorting, we'd need to join with fares
        // For now, fall back to departure time
        queryBuilder.orderBy('flight.scheduledDepartureTime', sortOrder.toUpperCase());
        break;
      case 'duration':
        queryBuilder.orderBy('schedule.duration', sortOrder.toUpperCase());
        break;
      case 'arrivalTime':
        queryBuilder.orderBy('flight.scheduledArrivalTime', sortOrder.toUpperCase());
        break;
      case 'departureTime':
      default:
        queryBuilder.orderBy('flight.scheduledDepartureTime', sortOrder.toUpperCase());
        break;
    }
  }

  /**
   * Advanced flight search with all filters
   */
  async advancedSearch(
    searchDto: AdvancedSearchFlightsDto,
  ): Promise<SearchResult> {
    const {
      origin,
      destination,
      tripType = TripType.ONE_WAY,
      returnDate,
      returnDateFrom,
      returnDateTo,
      includeNearbyAirports = false,
      nearbyAirportsRadius = 50,
      page = 1,
      limit = 10,
      sortBy = 'departureTime',
      sortOrder = 'asc',
      minPrice,
      maxPrice,
      fareClass,
    } = searchDto;

    // Get airports (with nearby if requested)
    const originAirports = await this.getSearchAirports(
      origin,
      includeNearbyAirports,
      nearbyAirportsRadius,
    );
    const destinationAirports = await this.getSearchAirports(
      destination,
      includeNearbyAirports,
      nearbyAirportsRadius,
    );

    // Find routes
    const routes = await this.findRoutes(originAirports, destinationAirports);
    const routeIds = routes.map((r) => r.id);

    if (routeIds.length === 0) {
      return {
        flights: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    }

    // Build query for outbound flights
    const queryBuilder = this.buildBaseQuery();
    this.applyFilters(queryBuilder, searchDto, routeIds);
    await this.applyPriceFilters(queryBuilder, minPrice, maxPrice, fareClass);
    this.applySorting(queryBuilder, sortBy, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const flights = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const result: SearchResult = {
      flights,
      total,
      page,
      limit,
      hasMore: total > page * limit,
    };

    // Handle round-trip search
    if (tripType === TripType.ROUND_TRIP && (returnDate || returnDateFrom || returnDateTo)) {
      const returnRoutes = await this.findRoutes(destinationAirports, originAirports);
      const returnRouteIds = returnRoutes.map((r) => r.id);

      if (returnRouteIds.length > 0) {
        const returnQueryBuilder = this.buildBaseQuery();
        returnQueryBuilder.andWhere('flight.routeId IN (:...routeIds)', {
          routeIds: returnRouteIds,
        });

        if (returnDate) {
          returnQueryBuilder.andWhere('DATE(flight.departureDate) = :returnDate', {
            returnDate: returnDate.split('T')[0],
          });
        } else if (returnDateFrom || returnDateTo) {
          if (returnDateFrom) {
            returnQueryBuilder.andWhere('DATE(flight.departureDate) >= :returnDateFrom', {
              returnDateFrom: returnDateFrom.split('T')[0],
            });
          }
          if (returnDateTo) {
            returnQueryBuilder.andWhere('DATE(flight.departureDate) <= :returnDateTo', {
              returnDateTo: returnDateTo.split('T')[0],
            });
          }
        }

        returnQueryBuilder.andWhere('flight.availableSeats >= :passengers', {
          passengers: searchDto.passengers || 1,
        });
        returnQueryBuilder.andWhere('flight.status != :cancelledStatus', {
          cancelledStatus: FlightStatus.CANCELLED,
        });

        this.applySorting(returnQueryBuilder, sortBy, sortOrder);

        result.returnFlights = await returnQueryBuilder.getMany();
      }
    }

    return result;
  }

  /**
   * Multi-city search
   */
  async multiCitySearch(
    segments: MultiCitySegment[],
    searchDto: AdvancedSearchFlightsDto,
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const segment of segments) {
      const segmentSearchDto: AdvancedSearchFlightsDto = {
        ...searchDto,
        origin: segment.origin,
        destination: segment.destination,
        departureDate: segment.departureDate,
        tripType: TripType.ONE_WAY,
      };

      const result = await this.advancedSearch(segmentSearchDto);
      results.push(result);
    }

    return results;
  }

  /**
   * Check real-time availability for a flight
   */
  async checkAvailability(
    checkDto: CheckAvailabilityDto,
  ): Promise<AvailabilityResult> {
    const { flightId, passengers, fareClass } = checkDto;

    const flight = await this.flightRepository.findOne({
      where: { id: flightId },
      relations: ['aircraft', 'aircraft.seatConfiguration'],
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${flightId} not found`);
    }

    // Check overall availability
    const availableSeats = flight.availableSeats;
    const isAvailable = availableSeats >= passengers;

    // Check fare class specific availability if specified
    let fareClassAvailability = availableSeats;
    if (fareClass) {
      const fare = await this.fareRepository.findOne({
        where: { flightId, fareClass, isActive: true },
      });

      if (fare) {
        fareClassAvailability = fare.availableSeats;
      } else {
        return {
          flightId,
          isAvailable: false,
          availableSeats: 0,
          requestedSeats: passengers,
          fareClass,
          canOverbook: false,
          waitlistAvailable: false,
          message: `Fare class ${fareClass} not available for this flight`,
        };
      }
    }

    // Overbooking policy: Allow up to 10% over capacity
    const totalCapacity = flight.aircraft?.seatConfiguration?.totalSeats || 0;
    const overbookLimit = Math.floor(totalCapacity * 1.1);
    const canOverbook = flight.bookedSeats + passengers <= overbookLimit;

    // Waitlist available if flight is fully booked but not over overbook limit
    const waitlistAvailable = !isAvailable && canOverbook;

    return {
      flightId,
      isAvailable: isAvailable || (fareClass ? fareClassAvailability >= passengers : false),
      availableSeats: fareClass ? fareClassAvailability : availableSeats,
      requestedSeats: passengers,
      fareClass,
      canOverbook,
      waitlistAvailable,
      message: isAvailable
        ? 'Seats available'
        : waitlistAvailable
        ? 'Flight is full, but waitlist is available'
        : 'Flight is fully booked',
    };
  }

  /**
   * Get availability for multiple flights
   */
  async checkMultipleAvailability(
    flightIds: string[],
    passengers: number,
    fareClass?: FareClass,
  ): Promise<AvailabilityResult[]> {
    const results: AvailabilityResult[] = [];

    for (const flightId of flightIds) {
      const result = await this.checkAvailability({
        flightId,
        passengers,
        fareClass,
      });
      results.push(result);
    }

    return results;
  }
}

