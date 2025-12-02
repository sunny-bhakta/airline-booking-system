import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airport, AirportType } from '../../flights/entities/airport.entity';
import { SeatConfiguration, SeatClass } from '../../flights/entities/seat-configuration.entity';
import { Aircraft } from '../../flights/entities/aircraft.entity';
import { Route } from '../../flights/entities/route.entity';
import { Schedule } from '../../flights/entities/schedule.entity';
import { Flight, FlightStatus } from '../../flights/entities/flight.entity';
import { Terminal } from '../../flights/entities/terminal.entity';
import { Gate } from '../../flights/entities/gate.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { Passenger } from '../../bookings/entities/passenger.entity';
import { Ticket } from '../../bookings/entities/ticket.entity';
import { SeatAssignment } from '../../bookings/entities/seat-assignment.entity';
import { Fare, FareClass } from '../../pricing/entities/fare.entity';
import { FareRule } from '../../pricing/entities/fare-rule.entity';
import { TaxFee, TaxFeeType, TaxFeeCalculationType } from '../../pricing/entities/tax-fee.entity';
import { PromotionalCode, PromotionalCodeType, PromotionalCodeStatus } from '../../pricing/entities/promotional-code.entity';
import { User, UserRole, UserStatus } from '../../users/entities/user.entity';
import { UserProfile } from '../../users/entities/user-profile.entity';
import { PaymentMethod, PaymentMethodType } from '../../users/entities/payment-method.entity';
import { TravelPreference, SeatPreference, MealPreference } from '../../users/entities/travel-preference.entity';
import { LoyaltyMembership, LoyaltyTier } from '../../users/entities/loyalty-membership.entity';
import * as crypto from 'crypto';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Airport)
    private readonly airportRepository: Repository<Airport>,
    @InjectRepository(SeatConfiguration)
    private readonly seatConfigRepository: Repository<SeatConfiguration>,
    @InjectRepository(Aircraft)
    private readonly aircraftRepository: Repository<Aircraft>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    @InjectRepository(Terminal)
    private readonly terminalRepository: Repository<Terminal>,
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Passenger)
    private readonly passengerRepository: Repository<Passenger>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(SeatAssignment)
    private readonly seatAssignmentRepository: Repository<SeatAssignment>,
    @InjectRepository(Fare)
    private readonly fareRepository: Repository<Fare>,
    @InjectRepository(FareRule)
    private readonly fareRuleRepository: Repository<FareRule>,
    @InjectRepository(TaxFee)
    private readonly taxFeeRepository: Repository<TaxFee>,
    @InjectRepository(PromotionalCode)
    private readonly promotionalCodeRepository: Repository<PromotionalCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(TravelPreference)
    private readonly travelPreferenceRepository: Repository<TravelPreference>,
    @InjectRepository(LoyaltyMembership)
    private readonly loyaltyMembershipRepository: Repository<LoyaltyMembership>,
  ) {}

  /**
   * Hash password using SHA-256 (same as in users.service.ts)
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async seedAll() {
    console.log('🌱 Starting database seeding...\n');

    const airports = await this.seedAirports();
    const terminals = await this.seedTerminals(airports);
    const gates = await this.seedGates(terminals, airports);
    const seatConfigs = await this.seedSeatConfigurations();
    const aircrafts = await this.seedAircrafts(seatConfigs);
    const routes = await this.seedRoutes(airports);
    const schedules = await this.seedSchedules();
    const flights = await this.seedFlights(routes, schedules, aircrafts, gates, airports, terminals, seatConfigs);
    const bookings = await this.seedBookingsWithPassengers(flights);
    const tickets = await this.seedTickets(bookings);
    const seatAssignments = await this.seedSeatAssignments(bookings);
    const promotionalCodes = await this.seedPromotionalCodes();
    const fares = await this.seedFares(flights, routes, seatConfigs);
    const fareRules = await this.seedFareRules(fares);
    const taxFees = await this.seedTaxFees(fares);
    const users = await this.seedUsers();
    const userProfiles = await this.seedUserProfiles(users);
    const paymentMethods = await this.seedPaymentMethods(users);
    const travelPreferences = await this.seedTravelPreferences(users);
    const loyaltyMemberships = await this.seedLoyaltyMemberships(users);

    console.log('\n✅ Database seeding completed!');
    console.log(`   - ${airports.length} Airports`);
    console.log(`   - ${terminals.length} Terminals`);
    console.log(`   - ${gates.length} Gates`);
    console.log(`   - ${seatConfigs.length} Seat Configurations`);
    console.log(`   - ${aircrafts.length} Aircraft`);
    console.log(`   - ${routes.length} Routes`);
    console.log(`   - ${schedules.length} Schedules`);
    console.log(`   - ${flights.length} Flights`);
    console.log(`   - ${bookings.length} Bookings with Passengers`);
    console.log(`   - ${tickets.length} Tickets`);
    console.log(`   - ${seatAssignments.length} Seat Assignments`);
    console.log(`   - ${promotionalCodes.length} Promotional Codes`);
    console.log(`   - ${fares.length} Fares`);
    console.log(`   - ${fareRules.length} Fare Rules`);
    console.log(`   - ${taxFees.length} Tax Fees`);
    console.log(`   - ${users.length} Users`);
    console.log(`   - ${userProfiles.length} User Profiles`);
    console.log(`   - ${paymentMethods.length} Payment Methods`);
    console.log(`   - ${travelPreferences.length} Travel Preferences`);
    console.log(`   - ${loyaltyMemberships.length} Loyalty Memberships`);
  }

  async seedAirports(): Promise<Airport[]> {
    console.log('📍 Seeding airports...');
    const airportsData = [
      {
        iataCode: 'DEL',
        icaoCode: 'VIDP',
        name: 'Indira Gandhi International Airport',
        city: 'New Delhi',
        country: 'India',
        latitude: 28.5562,
        longitude: 77.1000,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'BOM',
        icaoCode: 'VABB',
        name: 'Chhatrapati Shivaji Maharaj International Airport',
        city: 'Mumbai',
        country: 'India',
        latitude: 19.0896,
        longitude: 72.8656,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'BLR',
        icaoCode: 'VOBL',
        name: 'Kempegowda International Airport',
        city: 'Bangalore',
        country: 'India',
        latitude: 13.1986,
        longitude: 77.7066,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'CCU',
        icaoCode: 'VECC',
        name: 'Netaji Subhash Chandra Bose International Airport',
        city: 'Kolkata',
        country: 'India',
        latitude: 22.6547,
        longitude: 88.4467,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'MAA',
        icaoCode: 'VOMM',
        name: 'Chennai International Airport',
        city: 'Chennai',
        country: 'India',
        latitude: 12.9941,
        longitude: 80.1806,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'HYD',
        icaoCode: 'VOHS',
        name: 'Rajiv Gandhi International Airport',
        city: 'Hyderabad',
        country: 'India',
        latitude: 17.2403,
        longitude: 78.4294,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'GOI',
        icaoCode: 'VAGO',
        name: 'Dabolim Airport',
        city: 'Goa',
        country: 'India',
        latitude: 15.3808,
        longitude: 73.8314,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
    ];

    const airports: Airport[] = [];
    for (const data of airportsData) {
      let airport = await this.airportRepository.findOne({
        where: { iataCode: data.iataCode },
      });

      if (!airport) {
        airport = this.airportRepository.create(data);
        airport = await this.airportRepository.save(airport);
        // We used airportRepository.create(data) to instantiate a new Airport entity object from the plain data,
        // then airportRepository.save(airport) to persist it to the database.
        // But you can also just do airportRepository.save(data) directly, because save() can accept a plain object.
        // The create + save split is useful if you want to do something (like set defaults, validate, or modify) before saving.
        // In this seed case, either approach is fine.
        console.log(`   ✓ Created airport: ${data.iataCode} - ${data.name}`);
      } else {
        console.log(`   ⊙ Airport already exists: ${data.iataCode}`);
      }
      airports.push(airport);
    }

    return airports;
  }

  async seedTerminals(airports: Airport[]): Promise<Terminal[]> {
    console.log('\n🏢 Seeding terminals...');
    const terminalsData = [
      // Delhi (DEL) - Indira Gandhi International Airport
      { airport: airports[0], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[0], name: 'Terminal 2', description: 'Domestic Terminal' },
      { airport: airports[0], name: 'Terminal 3', description: 'International Terminal' },
      
      // Mumbai (BOM) - Chhatrapati Shivaji Maharaj International Airport
      { airport: airports[1], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[1], name: 'Terminal 2', description: 'International Terminal' },
      
      // Bangalore (BLR) - Kempegowda International Airport
      { airport: airports[2], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[2], name: 'Terminal 2', description: 'International Terminal' },
      
      // Kolkata (CCU) - Netaji Subhash Chandra Bose International Airport
      { airport: airports[3], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[3], name: 'Terminal 2', description: 'International Terminal' },
      
      // Chennai (MAA) - Chennai International Airport
      { airport: airports[4], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[4], name: 'Terminal 2', description: 'International Terminal' },
      
      // Hyderabad (HYD) - Rajiv Gandhi International Airport
      { airport: airports[5], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[5], name: 'Terminal 2', description: 'International Terminal' },
      
      // Goa (GOI) - Dabolim Airport
      { airport: airports[6], name: 'Terminal 1', description: 'Domestic & International Terminal' },
    ];

    const terminals: Terminal[] = [];
    for (const data of terminalsData) {
      let terminal = await this.terminalRepository.findOne({
        where: {
          airportId: data.airport.id,
          name: data.name,
        },
      });

      if (!terminal) {
        terminal = this.terminalRepository.create({
          airportId: data.airport.id,
          name: data.name,
          description: data.description,
          isActive: true,
        });
        terminal = await this.terminalRepository.save(terminal);
        console.log(`   ✓ Created terminal: ${data.airport.iataCode} - ${data.name}`);
      } else {
        console.log(`   ⊙ Terminal already exists: ${data.airport.iataCode} - ${data.name}`);
      }
      terminals.push(terminal);
    }

    return terminals;
  }

  async seedGates(terminals: Terminal[], airports: Airport[]): Promise<Gate[]> {
    console.log('\n🚪 Seeding gates...');
    const gatesData = [];

    // Create gates for each terminal
    for (const terminal of terminals) {
      const airport = airports.find(a => a.id === terminal.airportId);
      if (!airport) {
        console.log(`   ⚠ Skipping terminal ${terminal.name} - airport not found`);
        continue;
      }
      const airportCode = airport.iataCode;
      const terminalNum = terminal.name.replace('Terminal ', '');
      
      // Create 8-12 gates per terminal
      const gateCount = airportCode === 'DEL' && terminalNum === '3' ? 12 : 
                       airportCode === 'BOM' && terminalNum === '2' ? 10 : 8;
      
      // Gate naming: A1, A2, A3, B1, B2, B3, C1, C2, C3, etc.
      const gateLetters = ['A', 'B', 'C', 'D'];
      let gateIndex = 0;
      
      for (let letterIndex = 0; letterIndex < gateLetters.length && gateIndex < gateCount; letterIndex++) {
        const letter = gateLetters[letterIndex];
        for (let num = 1; num <= 3 && gateIndex < gateCount; num++) {
          const gateName = `${letter}${num}`;
          gatesData.push({
            terminal,
            number: gateName,
            description: `Gate ${gateName} - ${terminal.description}`,
          });
          gateIndex++;
        }
      }
    }

    const gates: Gate[] = [];
    for (const data of gatesData) {
      let gate = await this.gateRepository.findOne({
        where: {
          terminalId: data.terminal.id,
          number: data.number,
        },
      });

      if (!gate) {
        gate = this.gateRepository.create({
          terminalId: data.terminal.id,
          number: data.number,
          description: data.description,
          isActive: true,
        });
        gate = await this.gateRepository.save(gate);
      }
      gates.push(gate);
    }

    console.log(`   ✓ Created ${gates.length} gates across all terminals`);
    return gates;
  }

  async seedSeatConfigurations(): Promise<SeatConfiguration[]> {
    console.log('\n💺 Seeding seat configurations...');
    const configsData = [
      {
        name: 'Boeing 737-800 Standard',
        layout: {
          rows: 30,
          seatsPerRow: 6,
          classes: [
            {
              class: SeatClass.FIRST,
              startRow: 1,
              endRow: 2,
              seatsPerRow: 4,
              seatMap: ['A', 'B', 'C', 'D'],
            },
            {
              class: SeatClass.BUSINESS,
              startRow: 3,
              endRow: 8,
              seatsPerRow: 6,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F'],
            },
            {
              class: SeatClass.ECONOMY,
              startRow: 9,
              endRow: 30,
              seatsPerRow: 6,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F'],
            },
          ],
        },
        totalSeats: 180,
        seatCountByClass: {
          [SeatClass.FIRST]: 8,
          [SeatClass.BUSINESS]: 36,
          [SeatClass.ECONOMY]: 136,
          [SeatClass.PREMIUM_ECONOMY]: 0,
        },
      },
      {
        name: 'Airbus A320 Standard',
        layout: {
          rows: 28,
          seatsPerRow: 6,
          classes: [
            {
              class: SeatClass.BUSINESS,
              startRow: 1,
              endRow: 4,
              seatsPerRow: 6,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F'],
            },
            {
              class: SeatClass.ECONOMY,
              startRow: 5,
              endRow: 28,
              seatsPerRow: 6,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F'],
            },
          ],
        },
        totalSeats: 168,
        seatCountByClass: {
          [SeatClass.FIRST]: 0,
          [SeatClass.BUSINESS]: 24,
          [SeatClass.ECONOMY]: 144,
          [SeatClass.PREMIUM_ECONOMY]: 0,
        },
      },
      {
        name: 'Boeing 777-300ER Wide Body',
        layout: {
          rows: 42,
          seatsPerRow: 10,
          classes: [
            {
              class: SeatClass.FIRST,
              startRow: 1,
              endRow: 3,
              seatsPerRow: 4,
              seatMap: ['A', 'B', 'C', 'D'],
            },
            {
              class: SeatClass.BUSINESS,
              startRow: 4,
              endRow: 12,
              seatsPerRow: 6,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F'],
            },
            {
              class: SeatClass.PREMIUM_ECONOMY,
              startRow: 13,
              endRow: 18,
              seatsPerRow: 8,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
            },
            {
              class: SeatClass.ECONOMY,
              startRow: 19,
              endRow: 42,
              seatsPerRow: 10,
              seatMap: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
            },
          ],
        },
        totalSeats: 396,
        seatCountByClass: {
          [SeatClass.FIRST]: 12,
          [SeatClass.BUSINESS]: 54,
          [SeatClass.PREMIUM_ECONOMY]: 48,
          [SeatClass.ECONOMY]: 282,
        },
      },
    ];

    const configs: SeatConfiguration[] = [];
    for (const data of configsData) {
      let config = await this.seatConfigRepository.findOne({
        where: { name: data.name },
      });

      if (!config) {
        config = this.seatConfigRepository.create(data);
        config = await this.seatConfigRepository.save(config);
        console.log(`   ✓ Created seat config: ${data.name} (${data.totalSeats} seats)`);
      } else {
        console.log(`   ⊙ Seat config already exists: ${data.name}`);
      }
      configs.push(config);
    }

    return configs;
  }

  async seedAircrafts(seatConfigs: SeatConfiguration[]): Promise<Aircraft[]> {
    console.log('\n✈️  Seeding aircraft...');
    const aircraftsData = [
      {
        registrationNumber: 'VT-AAA',
        model: 'Boeing 737-800',
        manufacturer: 'Boeing',
        yearOfManufacture: 2018,
        seatConfigurationId: seatConfigs[0].id,
      },
      {
        registrationNumber: 'VT-AAB',
        model: 'Boeing 737-800',
        manufacturer: 'Boeing',
        yearOfManufacture: 2019,
        seatConfigurationId: seatConfigs[0].id,
      },
      {
        registrationNumber: 'VT-AAC',
        model: 'Airbus A320',
        manufacturer: 'Airbus',
        yearOfManufacture: 2020,
        seatConfigurationId: seatConfigs[1].id,
      },
      {
        registrationNumber: 'VT-AAD',
        model: 'Airbus A320',
        manufacturer: 'Airbus',
        yearOfManufacture: 2021,
        seatConfigurationId: seatConfigs[1].id,
      },
      {
        registrationNumber: 'VT-AAE',
        model: 'Boeing 777-300ER',
        manufacturer: 'Boeing',
        yearOfManufacture: 2017,
        seatConfigurationId: seatConfigs[2].id,
      },
      {
        registrationNumber: 'VT-AAF',
        model: 'Boeing 737-800',
        manufacturer: 'Boeing',
        yearOfManufacture: 2022,
        seatConfigurationId: seatConfigs[0].id,
      },
    ];

    const aircrafts: Aircraft[] = [];
    for (const data of aircraftsData) {
      let aircraft = await this.aircraftRepository.findOne({
        where: { registrationNumber: data.registrationNumber },
      });

      if (!aircraft) {
        aircraft = this.aircraftRepository.create(data);
        aircraft = await this.aircraftRepository.save(aircraft);
        console.log(`   ✓ Created aircraft: ${data.registrationNumber} - ${data.model}`);
      } else {
        console.log(`   ⊙ Aircraft already exists: ${data.registrationNumber}`);
      }
      aircrafts.push(aircraft);
    }

    return aircrafts;
  }

  async seedRoutes(airports: Airport[]): Promise<Route[]> {
    console.log('\n🛣️  Seeding routes...');
    const routesData = [
      // DEL ↔ BOM (Delhi ↔ Mumbai)
      {
        originId: airports[0].id, // DEL
        destinationId: airports[1].id, // BOM
        distance: 1150,
        estimatedDuration: 135,
      },
      {
        originId: airports[1].id, // BOM
        destinationId: airports[0].id, // DEL
        distance: 1150,
        estimatedDuration: 135,
      },
      // DEL ↔ BLR (Delhi ↔ Bangalore)
      {
        originId: airports[0].id, // DEL
        destinationId: airports[2].id, // BLR
        distance: 1740,
        estimatedDuration: 150,
      },
      {
        originId: airports[2].id, // BLR
        destinationId: airports[0].id, // DEL
        distance: 1740,
        estimatedDuration: 150,
      },
      // BOM ↔ BLR (Mumbai ↔ Bangalore)
      {
        originId: airports[1].id, // BOM
        destinationId: airports[2].id, // BLR
        distance: 835,
        estimatedDuration: 105,
      },
      {
        originId: airports[2].id, // BLR
        destinationId: airports[1].id, // BOM
        distance: 835,
        estimatedDuration: 105,
      },
      // DEL ↔ CCU (Delhi ↔ Kolkata)
      {
        originId: airports[0].id, // DEL
        destinationId: airports[3].id, // CCU
        distance: 1305,
        estimatedDuration: 140,
      },
      {
        originId: airports[3].id, // CCU
        destinationId: airports[0].id, // DEL
        distance: 1305,
        estimatedDuration: 140,
      },
      // DEL ↔ MAA (Delhi ↔ Chennai)
      {
        originId: airports[0].id, // DEL
        destinationId: airports[4].id, // MAA
        distance: 1730,
        estimatedDuration: 150,
      },
      {
        originId: airports[4].id, // MAA
        destinationId: airports[0].id, // DEL
        distance: 1730,
        estimatedDuration: 150,
      },
      // BOM ↔ MAA (Mumbai ↔ Chennai)
      {
        originId: airports[1].id, // BOM
        destinationId: airports[4].id, // MAA
        distance: 1030,
        estimatedDuration: 120,
      },
      {
        originId: airports[4].id, // MAA
        destinationId: airports[1].id, // BOM
        distance: 1030,
        estimatedDuration: 120,
      },
      // BLR ↔ HYD (Bangalore ↔ Hyderabad)
      {
        originId: airports[2].id, // BLR
        destinationId: airports[5].id, // HYD
        distance: 575,
        estimatedDuration: 85,
      },
      {
        originId: airports[5].id, // HYD
        destinationId: airports[2].id, // BLR
        distance: 575,
        estimatedDuration: 85,
      },
      // BOM ↔ GOI (Mumbai ↔ Goa)
      {
        originId: airports[1].id, // BOM
        destinationId: airports[6].id, // GOI
        distance: 445,
        estimatedDuration: 70,
      },
      {
        originId: airports[6].id, // GOI
        destinationId: airports[1].id, // BOM
        distance: 445,
        estimatedDuration: 70,
      },
    ];

    const routes: Route[] = [];
    for (const data of routesData) {
      let route = await this.routeRepository.findOne({
        where: {
          originId: data.originId,
          destinationId: data.destinationId,
        },
      });

      if (!route) {
        route = this.routeRepository.create(data);
        route = await this.routeRepository.save(route);
        const origin = airports.find((a) => a.id === data.originId);
        const dest = airports.find((a) => a.id === data.destinationId);
        console.log(`   ✓ Created route: ${origin.iataCode} → ${dest.iataCode}`);
      } else {
        console.log(`   ⊙ Route already exists`);
      }
      routes.push(route);
    }

    return routes;
  }

  async seedSchedules(): Promise<Schedule[]> {
    console.log('\n⏰ Seeding schedules...');
    const schedulesData = [
      {
        departureTime: '08:00:00',
        arrivalTime: '14:00:00',
        duration: 360,
        daysOfWeek: '1,2,3,4,5',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '10:30:00',
        arrivalTime: '16:30:00',
        duration: 360,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '14:15:00',
        arrivalTime: '16:45:00',
        duration: 150,
        daysOfWeek: '1,2,3,4,5',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '18:00:00',
        arrivalTime: '21:00:00',
        duration: 180,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
    ];

    const schedules: Schedule[] = [];
    for (const data of schedulesData) {
      let schedule = await this.scheduleRepository.findOne({
        where: {
          departureTime: data.departureTime,
          arrivalTime: data.arrivalTime,
        },
      });

      if (!schedule) {
        schedule = this.scheduleRepository.create(data);
        schedule = await this.scheduleRepository.save(schedule);
        console.log(`   ✓ Created schedule: ${data.departureTime} - ${data.arrivalTime}`);
      } else {
        console.log(`   ⊙ Schedule already exists`);
      }
      schedules.push(schedule);
    }

    return schedules;
  }

  async seedFlights(
    routes: Route[],
    schedules: Schedule[],
    aircrafts: Aircraft[],
    gates: Gate[],
    airports: Airport[],
    terminals: Terminal[],
    seatConfigs: SeatConfiguration[],
  ): Promise<Flight[]> {
    console.log('\n🛫 Seeding flights...');
    const today = new Date();
    const flightsData = [];

    // Helper to get a random gate for an airport
    const getGateForAirport = (airportCode: string): string | null => {
      const airport = airports.find(a => a.iataCode === airportCode);
      if (!airport) return null;
      
      // Find terminals for this airport
      const airportTerminals = terminals.filter(t => t.airportId === airport.id);
      const terminalIds = airportTerminals.map(t => t.id);
      
      // Find gates that belong to these terminals
      const airportGates = gates.filter(g => terminalIds.includes(g.terminalId));
      if (airportGates.length === 0) return null;
      const randomGate = airportGates[Math.floor(Math.random() * airportGates.length)];
      return randomGate.id;
    };

    // Helper to find route by origin and destination IATA codes
    const findRouteByCodes = (originCode: string, destCode: string): Route | undefined => {
      const originAirport = airports.find(a => a.iataCode === originCode);
      const destAirport = airports.find(a => a.iataCode === destCode);
      if (!originAirport || !destAirport) return undefined;
      return routes.find(r => r.originId === originAirport.id && r.destinationId === destAirport.id);
    };

    // Create flights for the next 30 days
    for (let day = 0; day < 30; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);
      const dayOfWeek = flightDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Air India flights (AI)
      // DEL ↔ BOM
      const delBomRoute = findRouteByCodes('DEL', 'BOM');
      const bomDelRoute = findRouteByCodes('BOM', 'DEL');
      
      if (delBomRoute) {
        flightsData.push({
          flightNumber: 'AI101',
          routeId: delBomRoute.id,
          scheduleId: schedules[0].id, // Morning schedule
          aircraftId: aircrafts[0].id,
          departureDate: flightDate,
          gateId: getGateForAirport('DEL'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (bomDelRoute) {
        flightsData.push({
          flightNumber: 'AI102',
          routeId: bomDelRoute.id,
          scheduleId: schedules[1].id, // Midday schedule
          aircraftId: aircrafts[1].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BOM'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // DEL ↔ BLR
      const delBlrRoute = findRouteByCodes('DEL', 'BLR');
      const blrDelRoute = findRouteByCodes('BLR', 'DEL');
      
      if (delBlrRoute && day % 2 === 0) {
        flightsData.push({
          flightNumber: 'AI201',
          routeId: delBlrRoute.id,
          scheduleId: schedules[2].id,
          aircraftId: aircrafts[2].id,
          departureDate: flightDate,
          gateId: getGateForAirport('DEL'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (blrDelRoute && day % 2 === 0) {
        flightsData.push({
          flightNumber: 'AI202',
          routeId: blrDelRoute.id,
          scheduleId: schedules[3].id,
          aircraftId: aircrafts[3].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BLR'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // IndiGo flights (6E)
      // BOM ↔ BLR
      const bomBlrRoute = findRouteByCodes('BOM', 'BLR');
      const blrBomRoute = findRouteByCodes('BLR', 'BOM');
      
      if (bomBlrRoute) {
        flightsData.push({
          flightNumber: '6E301',
          routeId: bomBlrRoute.id,
          scheduleId: schedules[1].id,
          aircraftId: aircrafts[2].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BOM'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (blrBomRoute) {
        flightsData.push({
          flightNumber: '6E302',
          routeId: blrBomRoute.id,
          scheduleId: schedules[0].id,
          aircraftId: aircrafts[3].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BLR'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // DEL ↔ MAA
      const delMaaRoute = findRouteByCodes('DEL', 'MAA');
      const maaDelRoute = findRouteByCodes('MAA', 'DEL');
      
      if (delMaaRoute && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        flightsData.push({
          flightNumber: '6E401',
          routeId: delMaaRoute.id,
          scheduleId: schedules[0].id,
          aircraftId: aircrafts[4].id,
          departureDate: flightDate,
          gateId: getGateForAirport('DEL'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (maaDelRoute && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        flightsData.push({
          flightNumber: '6E402',
          routeId: maaDelRoute.id,
          scheduleId: schedules[3].id,
          aircraftId: aircrafts[4].id,
          departureDate: flightDate,
          gateId: getGateForAirport('MAA'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // BOM ↔ GOI (Mumbai ↔ Goa) - Daily
      const bomGoiRoute = findRouteByCodes('BOM', 'GOI');
      const goiBomRoute = findRouteByCodes('GOI', 'BOM');
      
      if (bomGoiRoute) {
        flightsData.push({
          flightNumber: '6E501',
          routeId: bomGoiRoute.id,
          scheduleId: schedules[1].id,
          aircraftId: aircrafts[5].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BOM'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (goiBomRoute) {
        flightsData.push({
          flightNumber: '6E502',
          routeId: goiBomRoute.id,
          scheduleId: schedules[3].id,
          aircraftId: aircrafts[5].id,
          departureDate: flightDate,
          gateId: getGateForAirport('GOI'),
          status: FlightStatus.SCHEDULED,
        });
      }
    }

    const flights: Flight[] = [];
    for (const data of flightsData) {
      // Calculate scheduled times
      const schedule = schedules.find((s) => s.id === data.scheduleId);
      if (!schedule) continue;

      const [hours, minutes] = schedule.departureTime.split(':').map(Number);
      const scheduledDepartureTime = new Date(data.departureDate);
      scheduledDepartureTime.setHours(hours, minutes, 0, 0);

      const scheduledArrivalTime = new Date(scheduledDepartureTime);
      scheduledArrivalTime.setMinutes(
        scheduledArrivalTime.getMinutes() + schedule.duration,
      );

      // Get aircraft for seat count
      const aircraft = aircrafts.find((a) => a.id === data.aircraftId);
      if (!aircraft) continue;
      
      // Look up seat configuration from seatConfigs array
      const seatConfig = seatConfigs.find((sc) => sc.id === aircraft.seatConfigurationId);
      if (!seatConfig) {
        console.log(`   ⚠ Skipping flight ${data.flightNumber} - seat configuration not found for aircraft ${aircraft.registrationNumber}`);
        continue;
      }
      const totalSeats = seatConfig.totalSeats;

      const existingFlight = await this.flightRepository.findOne({
        where: {
          flightNumber: data.flightNumber,
          departureDate: data.departureDate,
        },
      });

      if (!existingFlight) {
        const newFlight = this.flightRepository.create({
          flightNumber: data.flightNumber,
          routeId: data.routeId,
          scheduleId: data.scheduleId,
          aircraftId: data.aircraftId,
          departureDate: data.departureDate,
          scheduledDepartureTime,
          scheduledArrivalTime,
          gateId: data.gateId,
          status: data.status,
          availableSeats: totalSeats,
          bookedSeats: 0,
        });
        const savedFlight = await this.flightRepository.save(newFlight);
        flights.push(savedFlight);
      }
    }

    console.log(`   ✓ Created ${flights.length} flights for the next 30 days`);
    return flights;
  }

  async seedBookingsWithPassengers(flights: Flight[]): Promise<Booking[]> {
    console.log('\n📋 Seeding bookings with passengers...');
    
    if (flights.length === 0) {
      console.log('   ⚠ No flights available to create bookings');
      return [];
    }

    // Helper function to generate a random PNR
    const generatePNR = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let pnr = '';
      for (let i = 0; i < 6; i++) {
        pnr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pnr;
    };

    // Sample passenger data
    const samplePassengers = [
      {
        firstName: 'Raj',
        lastName: 'Kumar',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        email: 'raj.kumar@example.com',
        phoneNumber: '+91-9876543210',
        nationality: 'Indian',
        passportNumber: 'A1234567',
        passportExpiryDate: new Date('2030-05-15'),
        passportIssuingCountry: 'India',
        specialAssistance: null,
        frequentFlyerNumber: 'AI123456',
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        dateOfBirth: new Date('1992-08-22'),
        gender: 'female',
        email: 'priya.sharma@example.com',
        phoneNumber: '+91-9876543211',
        nationality: 'Indian',
        passportNumber: 'B2345678',
        passportExpiryDate: new Date('2031-08-22'),
        passportIssuingCountry: 'India',
        specialAssistance: null,
        frequentFlyerNumber: null,
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        dateOfBirth: new Date('1985-12-10'),
        gender: 'male',
        email: 'amit.patel@example.com',
        phoneNumber: '+91-9876543212',
        nationality: 'Indian',
        passportNumber: 'C3456789',
        passportExpiryDate: new Date('2029-12-10'),
        passportIssuingCountry: 'India',
        specialAssistance: 'Wheelchair assistance',
        frequentFlyerNumber: '6E789012',
      },
      {
        firstName: 'Sneha',
        lastName: 'Reddy',
        dateOfBirth: new Date('1995-03-18'),
        gender: 'female',
        email: 'sneha.reddy@example.com',
        phoneNumber: '+91-9876543213',
        nationality: 'Indian',
        passportNumber: 'D4567890',
        passportExpiryDate: new Date('2032-03-18'),
        passportIssuingCountry: 'India',
        specialAssistance: null,
        frequentFlyerNumber: null,
      },
      {
        firstName: 'Vikram',
        lastName: 'Singh',
        dateOfBirth: new Date('1988-07-25'),
        gender: 'male',
        email: 'vikram.singh@example.com',
        phoneNumber: '+91-9876543214',
        nationality: 'Indian',
        passportNumber: 'E5678901',
        passportExpiryDate: new Date('2030-07-25'),
        passportIssuingCountry: 'India',
        specialAssistance: null,
        frequentFlyerNumber: 'AI234567',
      },
      {
        firstName: 'Anjali',
        lastName: 'Mehta',
        dateOfBirth: new Date('1993-11-05'),
        gender: 'female',
        email: 'anjali.mehta@example.com',
        phoneNumber: '+91-9876543215',
        nationality: 'Indian',
        passportNumber: 'F6789012',
        passportExpiryDate: new Date('2031-11-05'),
        passportIssuingCountry: 'India',
        specialAssistance: null,
        frequentFlyerNumber: null,
      },
      {
        firstName: 'Rahul',
        lastName: 'Verma',
        dateOfBirth: new Date('1991-02-14'),
        gender: 'male',
        email: 'rahul.verma@example.com',
        phoneNumber: '+91-9876543216',
        nationality: 'Indian',
        passportNumber: 'G7890123',
        passportExpiryDate: new Date('2030-02-14'),
        passportIssuingCountry: 'India',
        specialAssistance: null,
        frequentFlyerNumber: '6E345678',
      },
      {
        firstName: 'Kavita',
        lastName: 'Joshi',
        dateOfBirth: new Date('1987-09-30'),
        gender: 'female',
        email: 'kavita.joshi@example.com',
        phoneNumber: '+91-9876543217',
        nationality: 'Indian',
        passportNumber: 'H8901234',
        passportExpiryDate: new Date('2029-09-30'),
        passportIssuingCountry: 'India',
        specialAssistance: 'Vegetarian meal preference',
        frequentFlyerNumber: null,
      },
    ];

    const bookings: Booking[] = [];
    const today = new Date();
    
    // Create bookings for some flights (select random flights)
    const flightsToBook = flights
      .filter(f => f.availableSeats > 0)
      .slice(0, Math.min(10, flights.length)); // Book up to 10 flights

    for (const flight of flightsToBook) {
      // Determine number of passengers (1-3 per booking)
      const numPassengers = Math.floor(Math.random() * 3) + 1;
      
      if (flight.availableSeats < numPassengers) {
        continue; // Skip if not enough seats
      }

      // Generate unique PNR
      let pnr = generatePNR();
      let existingBooking = await this.bookingRepository.findOne({ where: { pnr } });
      while (existingBooking) {
        pnr = generatePNR();
        existingBooking = await this.bookingRepository.findOne({ where: { pnr } });
      }

      // Calculate booking amount (base fare per passenger)
      const baseFare = 5000 + Math.random() * 15000; // Random fare between 5000-20000
      const totalAmount = baseFare * numPassengers;

      // Create booking
      const booking = this.bookingRepository.create({
        pnr,
        flightId: flight.id,
        status: Math.random() > 0.2 ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
        totalAmount,
        currency: 'INR',
        bookingDate: new Date(today.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
        confirmationDate: Math.random() > 0.2 ? new Date() : null,
      });

      const savedBooking = await this.bookingRepository.save(booking);

      // Create passengers for this booking
      const selectedPassengers = samplePassengers
        .sort(() => Math.random() - 0.5)
        .slice(0, numPassengers);

      const passengers = selectedPassengers.map((passengerData) =>
        this.passengerRepository.create({
          ...passengerData,
          bookingId: savedBooking.id,
        }),
      );

      const savedPassengers = await this.passengerRepository.save(passengers);

      // Update flight seat availability
      flight.bookedSeats += numPassengers;
      flight.availableSeats -= numPassengers;
      await this.flightRepository.save(flight);

      bookings.push(savedBooking);
      console.log(`   ✓ Created booking ${pnr} with ${numPassengers} passenger(s) for flight ${flight.flightNumber}`);
    }

    return bookings;
  }

  async seedTickets(bookings: Booking[]): Promise<Ticket[]> {
    console.log('\n🎫 Seeding tickets...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create tickets');
      return [];
    }

    // Helper to generate IATA ticket number (13 digits)
    const generateTicketNumber = (): string => {
      // IATA format: 3-digit airline code + 10-digit number
      // Using 123 as airline code for simplicity
      const randomNum = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
      return `123${randomNum}`;
    };

    const tickets: Ticket[] = [];
    
    // Create tickets for confirmed bookings only
    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
    
    for (const booking of confirmedBookings) {
      // Get passengers for this booking
      const passengers = await this.passengerRepository.find({
        where: { bookingId: booking.id },
      });

      for (const passenger of passengers) {
        // Check if ticket already exists
        const existingTicket = await this.ticketRepository.findOne({
          where: { bookingId: booking.id, passengerId: passenger.id },
        });

        if (existingTicket) {
          tickets.push(existingTicket);
          continue;
        }

        // Generate unique ticket number
        let ticketNumber = generateTicketNumber();
        let existingTicketNum = await this.ticketRepository.findOne({
          where: { ticketNumber },
        });
        while (existingTicketNum) {
          ticketNumber = generateTicketNumber();
          existingTicketNum = await this.ticketRepository.findOne({
            where: { ticketNumber },
          });
        }

        // Calculate fare breakdown (base fare, taxes, fees)
        const baseFare = booking.totalAmount / passengers.length;
        const taxes = baseFare * 0.15; // 15% taxes
        const fees = baseFare * 0.05; // 5% fees
        const totalFare = baseFare + taxes + fees;

        // Determine fare class (random for demo)
        const fareClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
        const fareClass = fareClasses[Math.floor(Math.random() * fareClasses.length)];

        const ticket = this.ticketRepository.create({
          ticketNumber,
          bookingId: booking.id,
          passengerId: passenger.id,
          fare: baseFare,
          taxes,
          fees,
          fareClass,
          issuedDate: booking.confirmationDate || booking.bookingDate || new Date(),
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          isActive: true,
          termsAndConditions: 'Standard airline terms and conditions apply.',
        });

        const savedTicket = await this.ticketRepository.save(ticket);
        tickets.push(savedTicket);
        console.log(`   ✓ Created ticket ${ticketNumber} for passenger ${passenger.firstName} ${passenger.lastName}`);
      }
    }

    return tickets;
  }

  async seedSeatAssignments(bookings: Booking[]): Promise<SeatAssignment[]> {
    console.log('\n💺 Seeding seat assignments...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create seat assignments');
      return [];
    }

    const seatAssignments: SeatAssignment[] = [];
    const seatTypes = ['window', 'aisle', 'middle', 'exit-row'];
    const seatClasses = ['economy', 'premium-economy', 'business', 'first'];
    const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (const booking of bookings) {
      // Get passengers for this booking
      const passengers = await this.passengerRepository.find({
        where: { bookingId: booking.id },
      });

      // Get flight to determine seat configuration
      const flight = await this.flightRepository.findOne({
        where: { id: booking.flightId },
        relations: ['aircraft', 'aircraft.seatConfiguration'],
      });

      if (!flight || !flight.aircraft) {
        continue;
      }

      // Get seat configuration
      const seatConfig = await this.seatConfigRepository.findOne({
        where: { id: flight.aircraft.seatConfigurationId },
      });

      if (!seatConfig) {
        continue;
      }

      // Assign seats to passengers
      const usedSeats = new Set<string>();
      let rowNumber = 5; // Start from row 5 to avoid conflicts
      
      for (const passenger of passengers) {
        // Check if seat already assigned
        const existingAssignment = await this.seatAssignmentRepository.findOne({
          where: { bookingId: booking.id, passengerId: passenger.id },
        });

        if (existingAssignment) {
          seatAssignments.push(existingAssignment);
          usedSeats.add(existingAssignment.seatNumber);
          continue;
        }

        // Determine seat class based on booking amount (simplified logic)
        let seatClass = 'economy';
        if (booking.totalAmount > 50000) {
          seatClass = 'first';
        } else if (booking.totalAmount > 30000) {
          seatClass = 'business';
        } else if (booking.totalAmount > 20000) {
          seatClass = 'premium-economy';
        }

        // Generate unique seat number
        let seatNumber: string;
        let attempts = 0;
        do {
          const seatLetter = seatLetters[Math.floor(Math.random() * seatLetters.length)];
          seatNumber = `${rowNumber}${seatLetter}`;
          attempts++;
          
          // If seat already used, try next row
          if (usedSeats.has(seatNumber)) {
            rowNumber++;
            if (rowNumber > seatConfig.layout.rows) {
              rowNumber = 5; // Reset if we exceed max rows
            }
          }
        } while (usedSeats.has(seatNumber) && attempts < 100);

        usedSeats.add(seatNumber);
        const seatType = seatTypes[Math.floor(Math.random() * seatTypes.length)];

        // Premium seat pricing (exit-row, window, aisle in business/first)
        let seatPrice = 0;
        if (seatType === 'exit-row' || (seatClass !== 'economy' && (seatType === 'window' || seatType === 'aisle'))) {
          seatPrice = 500 + Math.random() * 2000;
        }

        const seatAssignment = this.seatAssignmentRepository.create({
          bookingId: booking.id,
          passengerId: passenger.id,
          seatNumber,
          seatType,
          seatClass,
          seatPrice,
          isPreferred: Math.random() > 0.7, // 30% chance of being preferred
          assignedDate: booking.bookingDate || new Date(),
        });

        const savedAssignment = await this.seatAssignmentRepository.save(seatAssignment);
        seatAssignments.push(savedAssignment);
        rowNumber++; // Move to next row for next passenger
      }
    }

    console.log(`   ✓ Created ${seatAssignments.length} seat assignments`);
    return seatAssignments;
  }

  async seedPromotionalCodes(): Promise<PromotionalCode[]> {
    console.log('\n🎟️  Seeding promotional codes...');
    
    const today = new Date();
    const codesData = [
      {
        code: 'WELCOME10',
        name: 'Welcome Discount',
        description: '10% off on your first booking',
        type: PromotionalCodeType.PERCENTAGE,
        discountValue: 10,
        maxDiscountAmount: 5000,
        minPurchaseAmount: 5000,
        status: PromotionalCodeStatus.ACTIVE,
        validFrom: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        validTo: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxUses: 1000,
        currentUses: 0,
        maxUsesPerUser: 1,
        applicableFareClass: null,
        currency: 'INR',
        isFirstTimeUserOnly: true,
        termsAndConditions: 'Valid for first-time users only. Cannot be combined with other offers.',
      },
      {
        code: 'SUMMER2024',
        name: 'Summer Sale',
        description: 'Flat ₹2000 off on bookings above ₹15000',
        type: PromotionalCodeType.FIXED_AMOUNT,
        discountValue: 2000,
        maxDiscountAmount: 2000,
        minPurchaseAmount: 15000,
        status: PromotionalCodeStatus.ACTIVE,
        validFrom: new Date('2024-06-01'),
        validTo: new Date('2024-08-31'),
        maxUses: 500,
        currentUses: 0,
        maxUsesPerUser: 3,
        applicableFareClass: null,
        currency: 'INR',
        isFirstTimeUserOnly: false,
        termsAndConditions: 'Valid for bookings made between June and August 2024.',
      },
      {
        code: 'BUSINESS15',
        name: 'Business Class Discount',
        description: '15% off on Business and First class bookings',
        type: PromotionalCodeType.PERCENTAGE,
        discountValue: 15,
        maxDiscountAmount: 10000,
        minPurchaseAmount: 20000,
        status: PromotionalCodeStatus.ACTIVE,
        validFrom: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        validTo: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000),
        maxUses: 200,
        currentUses: 0,
        maxUsesPerUser: 2,
        applicableFareClass: 'Business,First',
        currency: 'INR',
        isFirstTimeUserOnly: false,
        termsAndConditions: 'Valid only for Business and First class bookings.',
      },
      {
        code: 'EARLYBIRD',
        name: 'Early Bird Special',
        description: '₹1500 off on advance bookings (30+ days)',
        type: PromotionalCodeType.FIXED_AMOUNT,
        discountValue: 1500,
        maxDiscountAmount: 1500,
        minPurchaseAmount: 10000,
        status: PromotionalCodeStatus.ACTIVE,
        validFrom: new Date(today),
        validTo: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
        maxUses: 300,
        currentUses: 0,
        maxUsesPerUser: 1,
        applicableFareClass: null,
        currency: 'INR',
        isFirstTimeUserOnly: false,
        termsAndConditions: 'Valid for bookings made at least 30 days in advance.',
      },
      {
        code: 'EXPIRED2023',
        name: 'Expired Code',
        description: 'This code has expired',
        type: PromotionalCodeType.PERCENTAGE,
        discountValue: 20,
        maxDiscountAmount: 5000,
        minPurchaseAmount: 5000,
        status: PromotionalCodeStatus.EXPIRED,
        validFrom: new Date('2023-01-01'),
        validTo: new Date('2023-12-31'),
        maxUses: 100,
        currentUses: 95,
        maxUsesPerUser: 1,
        applicableFareClass: null,
        currency: 'INR',
        isFirstTimeUserOnly: false,
        termsAndConditions: 'This promotional code has expired.',
      },
    ];

    const codes: PromotionalCode[] = [];
    for (const data of codesData) {
      let code = await this.promotionalCodeRepository.findOne({
        where: { code: data.code },
      });

      if (!code) {
        code = this.promotionalCodeRepository.create(data);
        code = await this.promotionalCodeRepository.save(code);
        console.log(`   ✓ Created promotional code: ${data.code} - ${data.name}`);
      } else {
        console.log(`   ⊙ Promotional code already exists: ${data.code}`);
      }
      codes.push(code);
    }

    return codes;
  }

  async seedFares(
    flights: Flight[],
    routes: Route[],
    seatConfigs: SeatConfiguration[],
  ): Promise<Fare[]> {
    console.log('\n💰 Seeding fares...');
    
    if (flights.length === 0) {
      console.log('   ⚠ No flights available to create fares');
      return [];
    }

    const fares: Fare[] = [];
    const today = new Date();

    // Base fare prices by class (in INR)
    const baseFaresByClass = {
      [FareClass.ECONOMY]: { min: 3000, max: 8000 },
      [FareClass.PREMIUM_ECONOMY]: { min: 8000, max: 15000 },
      [FareClass.BUSINESS]: { min: 20000, max: 40000 },
      [FareClass.FIRST]: { min: 50000, max: 100000 },
    };

    // Process a subset of flights (up to 50) to avoid too many fares
    const flightsToProcess = flights.slice(0, Math.min(50, flights.length));

    for (const flight of flightsToProcess) {
      // Get aircraft and seat configuration
      const aircraft = await this.aircraftRepository.findOne({
        where: { id: flight.aircraftId },
      });

      if (!aircraft) continue;

      const seatConfig = seatConfigs.find(sc => sc.id === aircraft.seatConfigurationId);
      if (!seatConfig) continue;

      // Create fares for each available seat class
      const availableClasses = seatConfig.layout.classes.filter(
        c => seatConfig.seatCountByClass[c.class] > 0
      );

      for (const classConfig of availableClasses) {
        // Map SeatClass to FareClass
        let fareClass: FareClass;
        switch (classConfig.class) {
          case SeatClass.FIRST:
            fareClass = FareClass.FIRST;
            break;
          case SeatClass.BUSINESS:
            fareClass = FareClass.BUSINESS;
            break;
          case SeatClass.PREMIUM_ECONOMY:
            fareClass = FareClass.PREMIUM_ECONOMY;
            break;
          default:
            fareClass = FareClass.ECONOMY;
        }

        // Check if fare already exists
        const existingFare = await this.fareRepository.findOne({
          where: { flightId: flight.id, fareClass },
        });

        if (existingFare) {
          fares.push(existingFare);
          continue;
        }

        // Calculate base fare
        const fareRange = baseFaresByClass[fareClass];
        const baseFare = fareRange.min + Math.random() * (fareRange.max - fareRange.min);

        // Dynamic price adjustment based on demand (0-20% increase)
        const dynamicAdjustment = baseFare * (Math.random() * 0.2);
        const totalFare = baseFare + dynamicAdjustment;

        // Available seats for this class
        const totalSeatsForClass = seatConfig.seatCountByClass[classConfig.class];
        const bookedSeatsForClass = Math.floor(totalSeatsForClass * Math.random() * 0.3); // 0-30% booked
        const availableSeatsForClass = totalSeatsForClass - bookedSeatsForClass;

        const fare = this.fareRepository.create({
          flightId: flight.id,
          routeId: flight.routeId,
          fareClass,
          baseFare: Math.round(baseFare * 100) / 100,
          dynamicPriceAdjustment: Math.round(dynamicAdjustment * 100) / 100,
          totalFare: Math.round(totalFare * 100) / 100,
          availableSeats: availableSeatsForClass,
          bookedSeats: bookedSeatsForClass,
          currency: 'INR',
          isActive: true,
          validFrom: today,
          validTo: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
        });

        const savedFare = await this.fareRepository.save(fare);
        fares.push(savedFare);
      }
    }

    console.log(`   ✓ Created ${fares.length} fares`);
    return fares;
  }

  async seedFareRules(fares: Fare[]): Promise<FareRule[]> {
    console.log('\n📜 Seeding fare rules...');
    
    if (fares.length === 0) {
      console.log('   ⚠ No fares available to create fare rules');
      return [];
    }

    const fareRules: FareRule[] = [];

    for (const fare of fares) {
      // Check if rule already exists
      const existingRule = await this.fareRuleRepository.findOne({
        where: { fareId: fare.id },
      });

      if (existingRule) {
        fareRules.push(existingRule);
        continue;
      }

      // Determine rules based on fare class
      let ruleConfig: Partial<FareRule>;
      
      if (fare.fareClass === FareClass.FIRST) {
        // First class: fully refundable, changeable
        ruleConfig = {
          fareId: fare.id,
          isRefundable: true,
          refundFee: 0,
          refundDeadlineDays: 0, // Anytime
          isChangeable: true,
          changeFee: 0,
          changeDeadlineDays: 0,
          requiresAdvancePurchase: false,
          requiresMinimumStay: false,
          requiresMaximumStay: false,
          isNonRefundable: false,
          isNonChangeable: false,
          allowsNameChange: true,
          nameChangeFee: 0,
          restrictions: null,
          termsAndConditions: 'First class tickets are fully refundable and changeable without fees.',
        };
      } else if (fare.fareClass === FareClass.BUSINESS) {
        // Business: mostly refundable with small fee
        ruleConfig = {
          fareId: fare.id,
          isRefundable: true,
          refundFee: 1000,
          refundDeadlineDays: 7, // 7 days before departure
          isChangeable: true,
          changeFee: 500,
          changeDeadlineDays: 3,
          requiresAdvancePurchase: false,
          requiresMinimumStay: false,
          requiresMaximumStay: false,
          isNonRefundable: false,
          isNonChangeable: false,
          allowsNameChange: true,
          nameChangeFee: 2000,
          restrictions: null,
          termsAndConditions: 'Business class tickets are refundable with a fee. Changes allowed with fee.',
        };
      } else if (fare.fareClass === FareClass.PREMIUM_ECONOMY) {
        // Premium Economy: partially refundable
        ruleConfig = {
          fareId: fare.id,
          isRefundable: true,
          refundFee: 2000,
          refundDeadlineDays: 14,
          isChangeable: true,
          changeFee: 1500,
          changeDeadlineDays: 7,
          requiresAdvancePurchase: false,
          requiresMinimumStay: false,
          requiresMaximumStay: false,
          isNonRefundable: false,
          isNonChangeable: false,
          allowsNameChange: true,
          nameChangeFee: 3000,
          restrictions: null,
          termsAndConditions: 'Premium Economy tickets have refund and change fees.',
        };
      } else {
        // Economy: restrictive rules
        const isFlexible = Math.random() > 0.5; // 50% chance of flexible economy
        
        if (isFlexible) {
          ruleConfig = {
            fareId: fare.id,
            isRefundable: true,
            refundFee: 3000,
            refundDeadlineDays: 21,
            isChangeable: true,
            changeFee: 2000,
            changeDeadlineDays: 14,
            requiresAdvancePurchase: false,
            requiresMinimumStay: false,
            requiresMaximumStay: false,
            isNonRefundable: false,
            isNonChangeable: false,
            allowsNameChange: false,
            nameChangeFee: null,
            restrictions: null,
            termsAndConditions: 'Flexible Economy tickets allow changes and refunds with fees.',
          };
        } else {
          ruleConfig = {
            fareId: fare.id,
            isRefundable: false,
            refundFee: null,
            refundDeadlineDays: null,
            isChangeable: false,
            changeFee: null,
            changeDeadlineDays: null,
            requiresAdvancePurchase: true,
            advancePurchaseDays: 14,
            requiresMinimumStay: false,
            requiresMaximumStay: false,
            isNonRefundable: true,
            isNonChangeable: true,
            allowsNameChange: false,
            nameChangeFee: null,
            restrictions: 'Non-refundable, non-changeable. Advance purchase required.',
            termsAndConditions: 'Basic Economy tickets are non-refundable and non-changeable.',
          };
        }
      }

      const fareRule = this.fareRuleRepository.create(ruleConfig);
      const savedRule = await this.fareRuleRepository.save(fareRule);
      fareRules.push(savedRule);
    }

    console.log(`   ✓ Created ${fareRules.length} fare rules`);
    return fareRules;
  }

  async seedTaxFees(fares: Fare[]): Promise<TaxFee[]> {
    console.log('\n💸 Seeding tax fees...');
    
    if (fares.length === 0) {
      console.log('   ⚠ No fares available to create tax fees');
      return [];
    }

    const taxFees: TaxFee[] = [];
    
    // Standard tax/fee types for Indian airports
    const standardTaxFees = [
      {
        type: TaxFeeType.AIRPORT_TAX,
        name: 'Airport Development Fee',
        calculationType: TaxFeeCalculationType.FIXED,
        amount: 200,
        minAmount: null,
        maxAmount: null,
        description: 'Airport development fee charged by Indian airports',
      },
      {
        type: TaxFeeType.FUEL_SURCHARGE,
        name: 'Fuel Surcharge',
        calculationType: TaxFeeCalculationType.PERCENTAGE,
        amount: 5, // 5% of base fare
        minAmount: 500,
        maxAmount: 5000,
        description: 'Fuel surcharge based on base fare',
      },
      {
        type: TaxFeeType.SERVICE_FEE,
        name: 'Service Fee',
        calculationType: TaxFeeCalculationType.FIXED,
        amount: 150,
        minAmount: null,
        maxAmount: null,
        description: 'Service fee for booking processing',
      },
      {
        type: TaxFeeType.SECURITY_FEE,
        name: 'Security Fee',
        calculationType: TaxFeeCalculationType.FIXED,
        amount: 100,
        minAmount: null,
        maxAmount: null,
        description: 'Security fee as per government regulations',
      },
    ];

    // Create tax fees for a subset of fares (to avoid too many records)
    const faresToProcess = fares.slice(0, Math.min(30, fares.length));

    for (const fare of faresToProcess) {
      for (const taxFeeData of standardTaxFees) {
        // Check if tax fee already exists
        const existingTaxFee = await this.taxFeeRepository.findOne({
          where: { fareId: fare.id, type: taxFeeData.type },
        });

        if (existingTaxFee) {
          taxFees.push(existingTaxFee);
          continue;
        }

        const taxFee = this.taxFeeRepository.create({
          fareId: fare.id,
          type: taxFeeData.type,
          name: taxFeeData.name,
          calculationType: taxFeeData.calculationType,
          amount: taxFeeData.amount,
          minAmount: taxFeeData.minAmount,
          maxAmount: taxFeeData.maxAmount,
          currency: 'INR',
          isActive: true,
          description: taxFeeData.description,
        });

        const savedTaxFee = await this.taxFeeRepository.save(taxFee);
        taxFees.push(savedTaxFee);
      }
    }

    console.log(`   ✓ Created ${taxFees.length} tax fees`);
    return taxFees;
  }

  async seedUsers(): Promise<User[]> {
    console.log('👤 Seeding users...');
    const usersData = [
      {
        username: 'admin',
        email: 'admin@airline.com',
        password: this.hashPassword('admin123'),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: this.hashPassword('password123'),
        role: UserRole.REGISTERED_USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        password: this.hashPassword('password123'),
        role: UserRole.REGISTERED_USER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      {
        username: 'staff1',
        email: 'staff1@airline.com',
        password: this.hashPassword('staff123'),
        role: UserRole.AIRLINE_STAFF,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      {
        username: 'agent1',
        email: 'agent1@travel.com',
        password: this.hashPassword('agent123'),
        role: UserRole.TRAVEL_AGENT,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      {
        username: 'customer1',
        email: 'customer1@example.com',
        password: this.hashPassword('password123'),
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
      },
      {
        username: 'pending_user',
        email: 'pending@example.com',
        password: this.hashPassword('password123'),
        role: UserRole.REGISTERED_USER,
        status: UserStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
      },
    ];

    const users = await this.userRepository.save(usersData);
    console.log(`   ✓ Created ${users.length} users`);
    return users;
  }

  async seedUserProfiles(users: User[]): Promise<UserProfile[]> {
    console.log('📋 Seeding user profiles...');
    const profilesData = [
      {
        userId: users[0].id, // admin
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1-555-0100',
        city: 'New York',
        country: 'USA',
      },
      {
        userId: users[1].id, // john_doe
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'Male',
        phoneNumber: '+1-555-0101',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        nationality: 'American',
        passportNumber: 'US123456789',
        passportExpiryDate: new Date('2030-12-31'),
        passportIssuingCountry: 'USA',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0102',
      },
      {
        userId: users[2].id, // jane_smith
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('1985-08-20'),
        gender: 'Female',
        phoneNumber: '+1-555-0103',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90001',
        nationality: 'American',
        passportNumber: 'US987654321',
        passportExpiryDate: new Date('2029-06-30'),
        passportIssuingCountry: 'USA',
        emergencyContactName: 'John Smith',
        emergencyContactPhone: '+1-555-0104',
        dietaryPreferences: 'Vegetarian',
      },
      {
        userId: users[3].id, // staff1
        firstName: 'Staff',
        lastName: 'Member',
        phoneNumber: '+1-555-0105',
        city: 'Chicago',
        country: 'USA',
      },
      {
        userId: users[4].id, // agent1
        firstName: 'Travel',
        lastName: 'Agent',
        phoneNumber: '+1-555-0106',
        city: 'Miami',
        country: 'USA',
      },
      {
        userId: users[5].id, // customer1
        firstName: 'Customer',
        lastName: 'One',
        dateOfBirth: new Date('1995-03-10'),
        gender: 'Other',
        phoneNumber: '+1-555-0107',
        city: 'Seattle',
        country: 'USA',
      },
    ];

    const profiles = await this.userProfileRepository.save(profilesData);
    console.log(`   ✓ Created ${profiles.length} user profiles`);
    return profiles;
  }

  async seedPaymentMethods(users: User[]): Promise<PaymentMethod[]> {
    console.log('💳 Seeding payment methods...');
    const paymentMethodsData = [
      {
        userId: users[1].id, // john_doe
        type: PaymentMethodType.CREDIT_CARD,
        cardHolderName: 'John Doe',
        lastFourDigits: '1234',
        cardBrand: 'Visa',
        expiryDate: new Date('2025-12-31'),
        isDefault: true,
        isActive: true,
        billingAddress: '123 Main Street, New York, NY 10001',
      },
      {
        userId: users[1].id, // john_doe
        type: PaymentMethodType.DEBIT_CARD,
        cardHolderName: 'John Doe',
        lastFourDigits: '5678',
        cardBrand: 'Mastercard',
        expiryDate: new Date('2026-06-30'),
        isDefault: false,
        isActive: true,
        billingAddress: '123 Main Street, New York, NY 10001',
      },
      {
        userId: users[2].id, // jane_smith
        type: PaymentMethodType.CREDIT_CARD,
        cardHolderName: 'Jane Smith',
        lastFourDigits: '9012',
        cardBrand: 'American Express',
        expiryDate: new Date('2027-03-31'),
        isDefault: true,
        isActive: true,
        billingAddress: '456 Oak Avenue, Los Angeles, CA 90001',
      },
      {
        userId: users[2].id, // jane_smith
        type: PaymentMethodType.DIGITAL_WALLET,
        walletProvider: 'PayPal',
        isDefault: false,
        isActive: true,
      },
      {
        userId: users[5].id, // customer1
        type: PaymentMethodType.UPI,
        accountNumber: 'customer1@paytm',
        isDefault: true,
        isActive: true,
      },
    ];

    const paymentMethods = await this.paymentMethodRepository.save(paymentMethodsData);
    console.log(`   ✓ Created ${paymentMethods.length} payment methods`);
    return paymentMethods;
  }

  async seedTravelPreferences(users: User[]): Promise<TravelPreference[]> {
    console.log('✈️  Seeding travel preferences...');
    const preferencesData = [
      {
        userId: users[1].id, // john_doe
        seatPreference: SeatPreference.WINDOW,
        mealPreference: MealPreference.NO_PREFERENCE,
        prefersWindowSeat: true,
        prefersAisleSeat: false,
        prefersExitRow: false,
        needsSpecialAssistance: false,
        prefersPriorityBoarding: true,
        prefersLoungeAccess: false,
        preferredAirline: 'Airline Name',
        travelClassPreference: 'Business',
      },
      {
        userId: users[2].id, // jane_smith
        seatPreference: SeatPreference.AISLE,
        mealPreference: MealPreference.VEGETARIAN,
        prefersWindowSeat: false,
        prefersAisleSeat: true,
        prefersExitRow: false,
        needsSpecialAssistance: false,
        prefersPriorityBoarding: true,
        prefersLoungeAccess: true,
        preferredAirline: 'Preferred Airline',
        travelClassPreference: 'First',
      },
      {
        userId: users[5].id, // customer1
        seatPreference: SeatPreference.NO_PREFERENCE,
        mealPreference: MealPreference.GLUTEN_FREE,
        prefersWindowSeat: false,
        prefersAisleSeat: false,
        prefersExitRow: true,
        needsSpecialAssistance: true,
        specialAssistanceDetails: 'Wheelchair assistance required',
        prefersPriorityBoarding: true,
        prefersLoungeAccess: false,
        travelClassPreference: 'Economy',
      },
    ];

    const preferences = await this.travelPreferenceRepository.save(preferencesData);
    console.log(`   ✓ Created ${preferences.length} travel preferences`);
    return preferences;
  }

  async seedLoyaltyMemberships(users: User[]): Promise<LoyaltyMembership[]> {
    console.log('🎖️  Seeding loyalty memberships...');
    const membershipsData = [
      {
        userId: users[1].id, // john_doe
        programName: 'SkyMiles',
        membershipNumber: 'DL123456789',
        tier: LoyaltyTier.GOLD,
        miles: 75000,
        points: 37500,
        tierExpiryDate: new Date('2025-12-31'),
        tierMilesRequired: 25000,
        isActive: true,
        benefits: JSON.stringify({
          priorityBoarding: true,
          loungeAccess: true,
          extraBaggage: '2 bags free',
          seatUpgrade: 'Complimentary upgrades available',
        }),
      },
      {
        userId: users[1].id, // john_doe
        programName: 'AAdvantage',
        membershipNumber: 'AA987654321',
        tier: LoyaltyTier.SILVER,
        miles: 35000,
        points: 17500,
        tierExpiryDate: new Date('2025-06-30'),
        tierMilesRequired: 15000,
        isActive: true,
        benefits: JSON.stringify({
          priorityBoarding: true,
          loungeAccess: false,
          extraBaggage: '1 bag free',
        }),
      },
      {
        userId: users[2].id, // jane_smith
        programName: 'SkyMiles',
        membershipNumber: 'DL987654321',
        tier: LoyaltyTier.PLATINUM,
        miles: 150000,
        points: 75000,
        tierExpiryDate: new Date('2026-12-31'),
        tierMilesRequired: 0,
        isActive: true,
        benefits: JSON.stringify({
          priorityBoarding: true,
          loungeAccess: true,
          extraBaggage: '3 bags free',
          seatUpgrade: 'Complimentary upgrades available',
          conciergeService: true,
        }),
      },
      {
        userId: users[5].id, // customer1
        programName: 'Miles & More',
        membershipNumber: 'LH123456789',
        tier: LoyaltyTier.BRONZE,
        miles: 5000,
        points: 2500,
        tierExpiryDate: new Date('2024-12-31'),
        tierMilesRequired: 45000,
        isActive: true,
        benefits: JSON.stringify({
          priorityBoarding: false,
          loungeAccess: false,
        }),
      },
    ];

    const memberships = await this.loyaltyMembershipRepository.save(membershipsData);
    console.log(`   ✓ Created ${memberships.length} loyalty memberships`);
    return memberships;
  }

  async clearAll() {
    console.log('🗑️  Clearing all data...');
    await this.loyaltyMembershipRepository.delete({});
    await this.travelPreferenceRepository.delete({});
    await this.paymentMethodRepository.delete({});
    await this.userProfileRepository.delete({});
    await this.userRepository.delete({});
    await this.seatAssignmentRepository.delete({});
    await this.ticketRepository.delete({});
    await this.taxFeeRepository.delete({});
    await this.fareRuleRepository.delete({});
    await this.fareRepository.delete({});
    await this.promotionalCodeRepository.delete({});
    await this.passengerRepository.delete({});
    await this.bookingRepository.delete({});
    await this.flightRepository.delete({});
    await this.gateRepository.delete({});
    await this.terminalRepository.delete({});
    await this.routeRepository.delete({});
    await this.scheduleRepository.delete({});
    await this.aircraftRepository.delete({});
    await this.seatConfigRepository.delete({});
    await this.airportRepository.delete({});
    console.log('✅ All data cleared!');
  }
}

