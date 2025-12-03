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
import { Baggage, BaggageType, SpecialBaggageCategory } from '../../ancillary/entities/baggage.entity';
import { InFlightService, InFlightServiceType, MealType } from '../../ancillary/entities/in-flight-service.entity';
import { TravelInsurance, InsuranceType, InsuranceStatus } from '../../ancillary/entities/travel-insurance.entity';
import { PaymentTransaction, PaymentStatus, PaymentType } from '../../payments/entities/payment-transaction.entity';
import { Invoice, InvoiceStatus } from '../../payments/entities/invoice.entity';
import { Receipt } from '../../payments/entities/receipt.entity';
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
    @InjectRepository(Baggage)
    private readonly baggageRepository: Repository<Baggage>,
    @InjectRepository(InFlightService)
    private readonly inFlightServiceRepository: Repository<InFlightService>,
    @InjectRepository(TravelInsurance)
    private readonly travelInsuranceRepository: Repository<TravelInsurance>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
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
    const baggageItems = await this.seedBaggage(bookings);
    const inFlightServices = await this.seedInFlightServices(bookings);
    const travelInsurancePolicies = await this.seedTravelInsurance(bookings);
    const paymentTransactions = await this.seedPaymentTransactions(bookings, users, paymentMethods);
    const invoices = await this.seedInvoices(bookings, users);
    const receipts = await this.seedReceipts(bookings, users, paymentTransactions, invoices);

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
    console.log(`   - ${baggageItems.length} Baggage Items`);
    console.log(`   - ${inFlightServices.length} In-Flight Services`);
    console.log(`   - ${travelInsurancePolicies.length} Travel Insurance Policies`);
    console.log(`   - ${paymentTransactions.length} Payment Transactions`);
    console.log(`   - ${invoices.length} Invoices`);
    console.log(`   - ${receipts.length} Receipts`);
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
      // Nearby airports for testing nearby airport search
      {
        iataCode: 'PNQ',
        icaoCode: 'VAPO',
        name: 'Pune Airport',
        city: 'Pune',
        country: 'India',
        latitude: 18.5822,
        longitude: 73.9197,
        timezone: 'Asia/Kolkata',
        type: AirportType.DOMESTIC,
      },
      {
        iataCode: 'IXC',
        icaoCode: 'VICG',
        name: 'Chandigarh Airport',
        city: 'Chandigarh',
        country: 'India',
        latitude: 30.6735,
        longitude: 76.7885,
        timezone: 'Asia/Kolkata',
        type: AirportType.DOMESTIC,
      },
      {
        iataCode: 'COK',
        icaoCode: 'VOCI',
        name: 'Cochin International Airport',
        city: 'Kochi',
        country: 'India',
        latitude: 9.9312,
        longitude: 76.2673,
        timezone: 'Asia/Kolkata',
        type: AirportType.INTERNATIONAL,
      },
      {
        iataCode: 'AMD',
        icaoCode: 'VAAH',
        name: 'Sardar Vallabhbhai Patel International Airport',
        city: 'Ahmedabad',
        country: 'India',
        latitude: 23.0772,
        longitude: 72.5714,
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
      
      // Pune (PNQ) - Pune Airport
      { airport: airports[7], name: 'Terminal 1', description: 'Domestic Terminal' },
      
      // Chandigarh (IXC) - Chandigarh Airport
      { airport: airports[8], name: 'Terminal 1', description: 'Domestic Terminal' },
      
      // Kochi (COK) - Cochin International Airport
      { airport: airports[9], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[9], name: 'Terminal 2', description: 'International Terminal' },
      
      // Ahmedabad (AMD) - Sardar Vallabhbhai Patel International Airport
      { airport: airports[10], name: 'Terminal 1', description: 'Domestic Terminal' },
      { airport: airports[10], name: 'Terminal 2', description: 'International Terminal' },
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
      // Additional routes for new airports and more connections
      // BOM ↔ PNQ (Mumbai ↔ Pune) - Nearby airports
      {
        originId: airports[1].id, // BOM
        destinationId: airports[7].id, // PNQ
        distance: 120,
        estimatedDuration: 30,
      },
      {
        originId: airports[7].id, // PNQ
        destinationId: airports[1].id, // BOM
        distance: 120,
        estimatedDuration: 30,
      },
      // DEL ↔ IXC (Delhi ↔ Chandigarh) - Nearby airports
      {
        originId: airports[0].id, // DEL
        destinationId: airports[8].id, // IXC
        distance: 240,
        estimatedDuration: 50,
      },
      {
        originId: airports[8].id, // IXC
        destinationId: airports[0].id, // DEL
        distance: 240,
        estimatedDuration: 50,
      },
      // BLR ↔ COK (Bangalore ↔ Kochi)
      {
        originId: airports[2].id, // BLR
        destinationId: airports[9].id, // COK
        distance: 560,
        estimatedDuration: 80,
      },
      {
        originId: airports[9].id, // COK
        destinationId: airports[2].id, // BLR
        distance: 560,
        estimatedDuration: 80,
      },
      // BOM ↔ AMD (Mumbai ↔ Ahmedabad)
      {
        originId: airports[1].id, // BOM
        destinationId: airports[10].id, // AMD
        distance: 520,
        estimatedDuration: 75,
      },
      {
        originId: airports[10].id, // AMD
        destinationId: airports[1].id, // BOM
        distance: 520,
        estimatedDuration: 75,
      },
      // DEL ↔ AMD (Delhi ↔ Ahmedabad)
      {
        originId: airports[0].id, // DEL
        destinationId: airports[10].id, // AMD
        distance: 950,
        estimatedDuration: 110,
      },
      {
        originId: airports[10].id, // AMD
        destinationId: airports[0].id, // DEL
        distance: 950,
        estimatedDuration: 110,
      },
      // HYD ↔ COK (Hyderabad ↔ Kochi)
      {
        originId: airports[5].id, // HYD
        destinationId: airports[9].id, // COK
        distance: 780,
        estimatedDuration: 95,
      },
      {
        originId: airports[9].id, // COK
        destinationId: airports[5].id, // HYD
        distance: 780,
        estimatedDuration: 95,
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
      // Additional schedules for more time variety
      {
        departureTime: '06:00:00',
        arrivalTime: '08:30:00',
        duration: 150,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '12:00:00',
        arrivalTime: '14:15:00',
        duration: 135,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '16:30:00',
        arrivalTime: '19:00:00',
        duration: 150,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '20:00:00',
        arrivalTime: '22:30:00',
        duration: 150,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '22:00:00',
        arrivalTime: '00:30:00',
        duration: 150,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '07:30:00',
        arrivalTime: '09:00:00',
        duration: 90,
        daysOfWeek: '1,2,3,4,5,6,7',
        effectiveFrom: new Date('2024-01-01'),
        effectiveTo: new Date('2025-12-31'),
      },
      {
        departureTime: '11:00:00',
        arrivalTime: '12:30:00',
        duration: 90,
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

      // Additional flights for new routes and more variety
      // BOM ↔ PNQ (Mumbai ↔ Pune) - Multiple daily flights
      const bomPnqRoute = findRouteByCodes('BOM', 'PNQ');
      const pnqBomRoute = findRouteByCodes('PNQ', 'BOM');
      
      if (bomPnqRoute && schedules.length > 4) {
        flightsData.push({
          flightNumber: '6E601',
          routeId: bomPnqRoute.id,
          scheduleId: schedules[4].id, // Early morning
          aircraftId: aircrafts[5].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BOM'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (pnqBomRoute && schedules.length > 5) {
        flightsData.push({
          flightNumber: '6E602',
          routeId: pnqBomRoute.id,
          scheduleId: schedules[5].id, // Midday
          aircraftId: aircrafts[5].id,
          departureDate: flightDate,
          gateId: getGateForAirport('PNQ'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // DEL ↔ IXC (Delhi ↔ Chandigarh)
      const delIxcRoute = findRouteByCodes('DEL', 'IXC');
      const ixcDelRoute = findRouteByCodes('IXC', 'DEL');
      
      if (delIxcRoute && schedules.length > 6) {
        flightsData.push({
          flightNumber: 'AI301',
          routeId: delIxcRoute.id,
          scheduleId: schedules[6].id, // Morning
          aircraftId: aircrafts[5].id,
          departureDate: flightDate,
          gateId: getGateForAirport('DEL'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (ixcDelRoute && schedules.length > 7) {
        flightsData.push({
          flightNumber: 'AI302',
          routeId: ixcDelRoute.id,
          scheduleId: schedules[7].id, // Midday
          aircraftId: aircrafts[5].id,
          departureDate: flightDate,
          gateId: getGateForAirport('IXC'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // BLR ↔ COK (Bangalore ↔ Kochi)
      const blrCokRoute = findRouteByCodes('BLR', 'COK');
      const cokBlrRoute = findRouteByCodes('COK', 'BLR');
      
      if (blrCokRoute && day % 2 === 0) {
        flightsData.push({
          flightNumber: '6E701',
          routeId: blrCokRoute.id,
          scheduleId: schedules[1].id,
          aircraftId: aircrafts[2].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BLR'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (cokBlrRoute && day % 2 === 0) {
        flightsData.push({
          flightNumber: '6E702',
          routeId: cokBlrRoute.id,
          scheduleId: schedules[3].id,
          aircraftId: aircrafts[2].id,
          departureDate: flightDate,
          gateId: getGateForAirport('COK'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // BOM ↔ AMD (Mumbai ↔ Ahmedabad)
      const bomAmdRoute = findRouteByCodes('BOM', 'AMD');
      const amdBomRoute = findRouteByCodes('AMD', 'BOM');
      
      if (bomAmdRoute) {
        flightsData.push({
          flightNumber: '6E801',
          routeId: bomAmdRoute.id,
          scheduleId: schedules[2].id,
          aircraftId: aircrafts[3].id,
          departureDate: flightDate,
          gateId: getGateForAirport('BOM'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (amdBomRoute) {
        flightsData.push({
          flightNumber: '6E802',
          routeId: amdBomRoute.id,
          scheduleId: schedules[0].id,
          aircraftId: aircrafts[3].id,
          departureDate: flightDate,
          gateId: getGateForAirport('AMD'),
          status: FlightStatus.SCHEDULED,
        });
      }

      // DEL ↔ AMD (Delhi ↔ Ahmedabad)
      const delAmdRoute = findRouteByCodes('DEL', 'AMD');
      const amdDelRoute = findRouteByCodes('AMD', 'DEL');
      
      if (delAmdRoute && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        flightsData.push({
          flightNumber: 'AI401',
          routeId: delAmdRoute.id,
          scheduleId: schedules[1].id,
          aircraftId: aircrafts[1].id,
          departureDate: flightDate,
          gateId: getGateForAirport('DEL'),
          status: FlightStatus.SCHEDULED,
        });
      }

      if (amdDelRoute && (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5)) {
        flightsData.push({
          flightNumber: 'AI402',
          routeId: amdDelRoute.id,
          scheduleId: schedules[3].id,
          aircraftId: aircrafts[1].id,
          departureDate: flightDate,
          gateId: getGateForAirport('AMD'),
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
        // Create flights with different availability levels for testing
        // Some flights fully booked, some partially booked, some empty
        let bookedSeats = 0;
        const randomFactor = Math.random();
        
        // 20% of flights are fully booked (80-100% booked)
        if (randomFactor < 0.2) {
          bookedSeats = Math.floor(totalSeats * (0.8 + Math.random() * 0.2));
        }
        // 30% of flights are partially booked (30-80% booked)
        else if (randomFactor < 0.5) {
          bookedSeats = Math.floor(totalSeats * (0.3 + Math.random() * 0.5));
        }
        // 30% of flights are lightly booked (10-30% booked)
        else if (randomFactor < 0.8) {
          bookedSeats = Math.floor(totalSeats * (0.1 + Math.random() * 0.2));
        }
        // 20% of flights are empty (0-10% booked)
        else {
          bookedSeats = Math.floor(totalSeats * Math.random() * 0.1);
        }
        
        // Ensure bookedSeats doesn't exceed totalSeats
        bookedSeats = Math.min(bookedSeats, totalSeats);
        const availableSeats = totalSeats - bookedSeats;

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
          availableSeats,
          bookedSeats,
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

    // Process more flights for better search testing (up to 200)
    const flightsToProcess = flights.slice(0, Math.min(200, flights.length));

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

        // Available seats for this class
        const totalSeatsForClass = seatConfig.seatCountByClass[classConfig.class];
        
        // Get actual booked seats from flight
        const flightBookedSeats = flight.bookedSeats || 0;
        const flightTotalSeats = flight.availableSeats + flightBookedSeats;
        
        // Calculate booked seats for this class proportionally
        // If flight has booked seats, distribute them across classes
        let bookedSeatsForClass = 0;
        if (flightBookedSeats > 0 && flightTotalSeats > 0) {
          // Proportion of this class seats to total seats
          const classProportion = totalSeatsForClass / flightTotalSeats;
          bookedSeatsForClass = Math.floor(flightBookedSeats * classProportion);
          // Add some randomness (within 20% of calculated value)
          const variation = Math.floor(bookedSeatsForClass * 0.2 * (Math.random() - 0.5));
          bookedSeatsForClass = Math.max(0, Math.min(totalSeatsForClass, bookedSeatsForClass + variation));
        } else {
          // If flight is empty, still add some random bookings (0-20% of class seats)
          bookedSeatsForClass = Math.floor(totalSeatsForClass * Math.random() * 0.2);
        }
        
        const availableSeatsForClass = totalSeatsForClass - bookedSeatsForClass;
        
        // Calculate base fare with more variation
        const fareRange = baseFaresByClass[fareClass];
        const baseFare = fareRange.min + Math.random() * (fareRange.max - fareRange.min);

        // Dynamic price adjustment based on demand and availability
        // Higher prices when fewer seats available (0-30% increase)
        const availabilityRatio = availableSeatsForClass / totalSeatsForClass;
        const demandMultiplier = 1 - availabilityRatio; // Higher when fewer seats
        const dynamicAdjustment = baseFare * (demandMultiplier * 0.3);
        const totalFare = baseFare + dynamicAdjustment;

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

  async seedBaggage(bookings: Booking[]): Promise<Baggage[]> {
    console.log('\n🧳 Seeding baggage...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create baggage');
      return [];
    }

    const baggageItems: Baggage[] = [];
    
    // Process a subset of bookings (up to 20)
    const bookingsToProcess = bookings.slice(0, Math.min(20, bookings.length));
    
    for (const booking of bookingsToProcess) {
      // Get passengers for this booking
      const passengers = await this.passengerRepository.find({
        where: { bookingId: booking.id },
      });

      if (passengers.length === 0) continue;

      // Randomly decide if this booking has baggage (70% chance)
      if (Math.random() > 0.3) {
        // Each passenger can have 1-3 baggage items
        for (const passenger of passengers) {
          const numBaggage = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < numBaggage; i++) {
            // Random baggage type
            const baggageTypes = [
              BaggageType.CABIN,
              BaggageType.CHECKED,
              BaggageType.EXCESS,
              BaggageType.SPECIAL,
            ];
            const type = baggageTypes[Math.floor(Math.random() * baggageTypes.length)];
            
            let specialCategory: SpecialBaggageCategory | null = null;
            let description: string | null = null;
            
            if (type === BaggageType.SPECIAL) {
              const specialCategories = [
                SpecialBaggageCategory.SPORTS_EQUIPMENT,
                SpecialBaggageCategory.PETS,
                SpecialBaggageCategory.FRAGILE,
                SpecialBaggageCategory.MUSICAL_INSTRUMENT,
                SpecialBaggageCategory.WHEELCHAIR,
                SpecialBaggageCategory.MEDICAL_EQUIPMENT,
              ];
              specialCategory = specialCategories[Math.floor(Math.random() * specialCategories.length)];
              description = `Special baggage: ${specialCategory}`;
            }

            // Weight based on type
            let weight: number;
            if (type === BaggageType.CABIN) {
              weight = 5 + Math.random() * 5; // 5-10 kg
            } else if (type === BaggageType.CHECKED) {
              weight = 15 + Math.random() * 20; // 15-35 kg
            } else {
              weight = 20 + Math.random() * 30; // 20-50 kg
            }

            // Dimensions for checked/excess/special baggage
            let length: number | null = null;
            let width: number | null = null;
            let height: number | null = null;
            
            if (type !== BaggageType.CABIN) {
              length = 50 + Math.random() * 100; // 50-150 cm
              width = 30 + Math.random() * 50; // 30-80 cm
              height = 20 + Math.random() * 50; // 20-70 cm
            }

            // Price calculation
            let price: number;
            if (type === BaggageType.CABIN) {
              price = 0; // Usually free
            } else if (type === BaggageType.CHECKED) {
              price = 500 + Math.random() * 1500; // 500-2000 INR
            } else if (type === BaggageType.EXCESS) {
              price = 2000 + Math.random() * 3000; // 2000-5000 INR
            } else {
              price = 1500 + Math.random() * 3500; // 1500-5000 INR
            }

            const baggage = this.baggageRepository.create({
              bookingId: booking.id,
              passengerId: passenger.id,
              type,
              specialCategory,
              weight: Math.round(weight * 100) / 100,
              length: length ? Math.round(length * 100) / 100 : null,
              width: width ? Math.round(width * 100) / 100 : null,
              height: height ? Math.round(height * 100) / 100 : null,
              quantity: 1,
              price: Math.round(price * 100) / 100,
              currency: 'INR',
              description,
              notes: type === BaggageType.SPECIAL ? 'Handle with care' : null,
            });

            const savedBaggage = await this.baggageRepository.save(baggage);
            baggageItems.push(savedBaggage);
          }
        }
      }
    }

    console.log(`   ✓ Created ${baggageItems.length} baggage items`);
    return baggageItems;
  }

  async seedInFlightServices(bookings: Booking[]): Promise<InFlightService[]> {
    console.log('\n🍽️  Seeding in-flight services...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create in-flight services');
      return [];
    }

    const services: InFlightService[] = [];
    
    // Process a subset of bookings (up to 25)
    const bookingsToProcess = bookings.slice(0, Math.min(25, bookings.length));
    
    for (const booking of bookingsToProcess) {
      // Get passengers for this booking
      const passengers = await this.passengerRepository.find({
        where: { bookingId: booking.id },
      });

      if (passengers.length === 0) continue;

      // Randomly decide if this booking has services (60% chance)
      if (Math.random() > 0.4) {
        // Each passenger can have 1-2 services
        for (const passenger of passengers) {
          const numServices = Math.floor(Math.random() * 2) + 1;
          
          for (let i = 0; i < numServices; i++) {
            const serviceTypes = [
              InFlightServiceType.MEAL,
              InFlightServiceType.ENTERTAINMENT,
              InFlightServiceType.WIFI,
              InFlightServiceType.PRIORITY_BOARDING,
              InFlightServiceType.LOUNGE_ACCESS,
              InFlightServiceType.EXTRA_LEGROOM,
            ];
            const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
            
            let mealType: MealType | null = null;
            let serviceName: string;
            let description: string;
            let price: number;
            let quantity = 1;
            
            switch (type) {
              case InFlightServiceType.MEAL:
                const mealTypes = [
                  MealType.STANDARD,
                  MealType.VEGETARIAN,
                  MealType.VEGAN,
                  MealType.HALAL,
                  MealType.GLUTEN_FREE,
                ];
                mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
                serviceName = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Meal`;
                description = `Premium ${mealType} meal service`;
                price = 500 + Math.random() * 1000; // 500-1500 INR
                break;
              case InFlightServiceType.ENTERTAINMENT:
                serviceName = 'Entertainment Package';
                description = 'Access to movies, TV shows, and games';
                price = 300 + Math.random() * 500; // 300-800 INR
                break;
              case InFlightServiceType.WIFI:
                serviceName = 'Wi-Fi Access';
                description = '24-hour in-flight Wi-Fi access';
                price = 400 + Math.random() * 600; // 400-1000 INR
                quantity = 1;
                break;
              case InFlightServiceType.PRIORITY_BOARDING:
                serviceName = 'Priority Boarding';
                description = 'Early boarding access';
                price = 200 + Math.random() * 300; // 200-500 INR
                break;
              case InFlightServiceType.LOUNGE_ACCESS:
                serviceName = 'Lounge Access';
                description = 'Airport lounge access before flight';
                price = 1000 + Math.random() * 1500; // 1000-2500 INR
                break;
              case InFlightServiceType.EXTRA_LEGROOM:
                serviceName = 'Extra Legroom Seat';
                description = 'Seat with additional legroom';
                price = 800 + Math.random() * 1200; // 800-2000 INR
                break;
              default:
                serviceName = 'Additional Service';
                description = 'Additional in-flight service';
                price = 500;
            }

            const service = this.inFlightServiceRepository.create({
              bookingId: booking.id,
              passengerId: passenger.id,
              type,
              mealType,
              serviceName,
              description,
              price: Math.round(price * 100) / 100,
              currency: 'INR',
              quantity,
              specialRequirements: mealType ? `Dietary preference: ${mealType}` : null,
              notes: null,
            });

            const savedService = await this.inFlightServiceRepository.save(service);
            services.push(savedService);
          }
        }
      }
    }

    console.log(`   ✓ Created ${services.length} in-flight services`);
    return services;
  }

  async seedTravelInsurance(bookings: Booking[]): Promise<TravelInsurance[]> {
    console.log('\n🛡️  Seeding travel insurance...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create travel insurance');
      return [];
    }

    const insurancePolicies: TravelInsurance[] = [];
    
    // Process a subset of bookings (up to 15)
    const bookingsToProcess = bookings.slice(0, Math.min(15, bookings.length));
    
    for (const booking of bookingsToProcess) {
      // Get passengers for this booking
      const passengers = await this.passengerRepository.find({
        where: { bookingId: booking.id },
      });

      if (passengers.length === 0) continue;

      // Randomly decide if this booking has insurance (40% chance)
      if (Math.random() > 0.6) {
        // Insurance is usually booking-level, but can be per passenger
        const passenger = passengers[0]; // Use first passenger
        
        const insuranceTypes = [
          InsuranceType.TRIP_CANCELLATION,
          InsuranceType.MEDICAL,
          InsuranceType.BAGGAGE,
          InsuranceType.FLIGHT_DELAY,
          InsuranceType.COMPREHENSIVE,
        ];
        const type = insuranceTypes[Math.floor(Math.random() * insuranceTypes.length)];
        
        let policyName: string;
        let description: string;
        let coverageAmount: number;
        let premium: number;
        
        switch (type) {
          case InsuranceType.TRIP_CANCELLATION:
            policyName = 'Trip Cancellation Insurance';
            description = 'Coverage for trip cancellation and interruption';
            coverageAmount = booking.totalAmount * 1.5; // 150% of booking amount
            premium = booking.totalAmount * 0.05; // 5% of booking amount
            break;
          case InsuranceType.MEDICAL:
            policyName = 'Medical Travel Insurance';
            description = 'Medical coverage during travel';
            coverageAmount = 500000 + Math.random() * 1000000; // 500K-1.5M INR
            premium = 1000 + Math.random() * 2000; // 1000-3000 INR
            break;
          case InsuranceType.BAGGAGE:
            policyName = 'Baggage Insurance';
            description = 'Coverage for lost or damaged baggage';
            coverageAmount = 50000 + Math.random() * 50000; // 50K-100K INR
            premium = 500 + Math.random() * 1000; // 500-1500 INR
            break;
          case InsuranceType.FLIGHT_DELAY:
            policyName = 'Flight Delay Insurance';
            description = 'Coverage for flight delays and cancellations';
            coverageAmount = booking.totalAmount * 0.3; // 30% of booking amount
            premium = booking.totalAmount * 0.02; // 2% of booking amount
            break;
          case InsuranceType.COMPREHENSIVE:
            policyName = 'Comprehensive Travel Insurance';
            description = 'Full coverage including medical, trip cancellation, baggage, and delays';
            coverageAmount = booking.totalAmount * 2 + Math.random() * 1000000; // 2x booking + up to 1M
            premium = booking.totalAmount * 0.08; // 8% of booking amount
            break;
          default:
            policyName = 'Travel Insurance';
            description = 'Standard travel insurance coverage';
            coverageAmount = booking.totalAmount;
            premium = booking.totalAmount * 0.05;
        }

        // Get flight for dates
        const flight = await this.flightRepository.findOne({
          where: { id: booking.flightId },
        });

        const startDate = flight?.scheduledDepartureTime || new Date();
        const endDate = flight?.scheduledArrivalTime 
          ? new Date(flight.scheduledArrivalTime.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days after arrival
          : new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from start

        const policyNumber = `POL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const insurance = this.travelInsuranceRepository.create({
          bookingId: booking.id,
          passengerId: passenger.id,
          type,
          policyName,
          description,
          coverageAmount: Math.round(coverageAmount * 100) / 100,
          currency: 'INR',
          premium: Math.round(premium * 100) / 100,
          status: InsuranceStatus.ACTIVE,
          startDate,
          endDate,
          policyNumber,
          provider: 'TravelGuard Insurance',
          termsAndConditions: 'Standard travel insurance terms and conditions apply. Please read the policy document for full details.',
          notes: null,
        });

        const savedInsurance = await this.travelInsuranceRepository.save(insurance);
        insurancePolicies.push(savedInsurance);
      }
    }

    console.log(`   ✓ Created ${insurancePolicies.length} travel insurance policies`);
    return insurancePolicies;
  }

  async seedPaymentTransactions(bookings: Booking[], users: User[], paymentMethods: PaymentMethod[]): Promise<PaymentTransaction[]> {
    console.log('\n💳 Seeding payment transactions...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create payment transactions');
      return [];
    }

    const transactions: PaymentTransaction[] = [];
    
    // Process confirmed bookings
    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
    const bookingsToProcess = confirmedBookings.slice(0, Math.min(30, confirmedBookings.length));
    
    for (const booking of bookingsToProcess) {
      // Find a user for this booking (or use null for guest booking)
      const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
      const userPaymentMethods = paymentMethods.filter(pm => pm.userId === user?.id);
      const paymentMethod = userPaymentMethods.length > 0 
        ? userPaymentMethods[Math.floor(Math.random() * userPaymentMethods.length)]
        : null;

      // Generate transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Determine payment status (mostly completed, some pending/failed)
      const statusRand = Math.random();
      let status: PaymentStatus;
      if (statusRand < 0.85) {
        status = PaymentStatus.COMPLETED;
      } else if (statusRand < 0.95) {
        status = PaymentStatus.PENDING;
      } else {
        status = PaymentStatus.FAILED;
      }

      const type = PaymentType.BOOKING_PAYMENT;
      const amount = booking.totalAmount;
      const currency = booking.currency || 'INR';

      // Payment gateway
      const gateways = ['Stripe', 'Razorpay', 'PayPal', 'PayU'];
      const paymentGateway = gateways[Math.floor(Math.random() * gateways.length)];
      const gatewayTransactionId = `${paymentGateway}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const transaction = this.paymentTransactionRepository.create({
        transactionId,
        bookingId: booking.id,
        userId: user?.id || null,
        paymentMethodId: paymentMethod?.id || null,
        status,
        type,
        amount,
        currency,
        refundedAmount: 0,
        paymentGateway: status === PaymentStatus.COMPLETED ? paymentGateway : null,
        gatewayTransactionId: status === PaymentStatus.COMPLETED ? gatewayTransactionId : null,
        gatewayResponse: status === PaymentStatus.COMPLETED 
          ? JSON.stringify({ success: true, message: 'Payment processed successfully' })
          : null,
        failureReason: status === PaymentStatus.FAILED ? 'Payment gateway declined transaction' : null,
        processedAt: status === PaymentStatus.COMPLETED ? new Date() : null,
        refundedAt: null,
        refundReason: null,
        notes: null,
        paymentMethodType: paymentMethod?.type || 'credit_card',
        cardLastFour: paymentMethod?.lastFourDigits || null,
        cardBrand: paymentMethod?.cardBrand || null,
      });

      const savedTransaction = await this.paymentTransactionRepository.save(transaction);
      transactions.push(savedTransaction);
    }

    console.log(`   ✓ Created ${transactions.length} payment transactions`);
    return transactions;
  }

  async seedInvoices(bookings: Booking[], users: User[]): Promise<Invoice[]> {
    console.log('\n📄 Seeding invoices...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create invoices');
      return [];
    }

    const invoices: Invoice[] = [];
    
    // Process confirmed bookings
    const confirmedBookings = bookings.filter(b => b.status === BookingStatus.CONFIRMED);
    const bookingsToProcess = confirmedBookings.slice(0, Math.min(25, confirmedBookings.length));
    
    for (const booking of bookingsToProcess) {
      // Find a user for this booking
      const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
      const userProfile = user 
        ? await this.userProfileRepository.findOne({ where: { userId: user.id } })
        : null;

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
      
      // Check if invoice already exists
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { bookingId: booking.id },
      });

      if (existingInvoice) {
        invoices.push(existingInvoice);
        continue;
      }

      // Calculate amounts
      const subtotal = booking.totalAmount * 0.85; // 85% base fare
      const taxes = booking.totalAmount * 0.10; // 10% taxes
      const fees = booking.totalAmount * 0.03; // 3% fees
      const discount = booking.totalAmount * 0.02; // 2% discount
      const totalAmount = booking.totalAmount;

      const invoiceDate = booking.bookingDate || new Date();
      const dueDate = new Date(invoiceDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from invoice date
      
      // Status based on payment
      const status = Math.random() > 0.2 ? InvoiceStatus.PAID : InvoiceStatus.ISSUED;
      const paidDate = status === InvoiceStatus.PAID ? new Date() : null;

      // Tax breakdown
      const taxBreakdown = JSON.stringify([
        { name: 'GST', rate: 5, amount: taxes * 0.5 },
        { name: 'Service Tax', rate: 5, amount: taxes * 0.5 },
      ]);

      const invoice = this.invoiceRepository.create({
        invoiceNumber,
        bookingId: booking.id,
        userId: user?.id || null,
        status,
        invoiceDate,
        dueDate,
        paidDate,
        subtotal: Math.round(subtotal * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        fees: Math.round(fees * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        currency: booking.currency || 'INR',
        billingName: userProfile 
          ? `${userProfile.firstName} ${userProfile.lastName}`
          : 'Guest Customer',
        billingEmail: user?.email || 'guest@example.com',
        billingPhone: userProfile?.phoneNumber || null,
        billingAddress: userProfile 
          ? `${userProfile.address || ''}, ${userProfile.city || ''}, ${userProfile.state || ''} ${userProfile.postalCode || ''}`.trim()
          : null,
        billingCity: userProfile?.city || null,
        billingState: userProfile?.state || null,
        billingPostalCode: userProfile?.postalCode || null,
        billingCountry: userProfile?.country || 'India',
        taxBreakdown,
        notes: 'Thank you for your booking. Please keep this invoice for your records.',
        termsAndConditions: 'Payment terms: Net 7 days. Late payment may incur additional fees.',
      });

      const savedInvoice = await this.invoiceRepository.save(invoice);
      invoices.push(savedInvoice);
    }

    console.log(`   ✓ Created ${invoices.length} invoices`);
    return invoices;
  }

  async seedReceipts(bookings: Booking[], users: User[], paymentTransactions: PaymentTransaction[], invoices: Invoice[]): Promise<Receipt[]> {
    console.log('\n🧾 Seeding receipts...');
    
    if (bookings.length === 0) {
      console.log('   ⚠ No bookings available to create receipts');
      return [];
    }

    const receipts: Receipt[] = [];
    
    // Process bookings with completed payments
    const completedTransactions = paymentTransactions.filter(t => t.status === PaymentStatus.COMPLETED);
    const bookingsWithPayments = bookings.filter(b => 
      completedTransactions.some(t => t.bookingId === b.id)
    );
    
    const bookingsToProcess = bookingsWithPayments.slice(0, Math.min(20, bookingsWithPayments.length));
    
    for (const booking of bookingsToProcess) {
      // Find related transaction and invoice
      const transaction = completedTransactions.find(t => t.bookingId === booking.id);
      const invoice = invoices.find(i => i.bookingId === booking.id);
      
      if (!transaction) continue;

      // Find user
      const user = users.find(u => u.id === transaction.userId) || null;

      // Generate receipt number
      const receiptNumber = `RCP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
      
      // Check if receipt already exists
      const existingReceipt = await this.receiptRepository.findOne({
        where: { bookingId: booking.id },
      });

      if (existingReceipt) {
        receipts.push(existingReceipt);
        continue;
      }

      // Calculate amounts (same as invoice if exists)
      let subtotal: number;
      let taxes: number;
      let fees: number;
      let discount: number;
      let amount: number;

      if (invoice) {
        subtotal = invoice.subtotal;
        taxes = invoice.taxes;
        fees = invoice.fees;
        discount = invoice.discount;
        amount = invoice.totalAmount;
      } else {
        subtotal = booking.totalAmount * 0.85;
        taxes = booking.totalAmount * 0.10;
        fees = booking.totalAmount * 0.03;
        discount = booking.totalAmount * 0.02;
        amount = booking.totalAmount;
      }

      const receiptDate = transaction.processedAt || booking.bookingDate || new Date();

      // Tax breakdown
      const taxBreakdown = JSON.stringify([
        { name: 'GST', rate: 5, amount: taxes * 0.5 },
        { name: 'Service Tax', rate: 5, amount: taxes * 0.5 },
      ]);

      const receipt = this.receiptRepository.create({
        receiptNumber,
        bookingId: booking.id,
        userId: user?.id || null,
        paymentTransactionId: transaction.id,
        invoiceId: invoice?.id || null,
        receiptDate,
        amount: Math.round(amount * 100) / 100,
        currency: booking.currency || 'INR',
        paymentMethod: transaction.paymentMethodType || 'Credit Card',
        paymentReference: transaction.gatewayTransactionId || transaction.transactionId,
        subtotal: Math.round(subtotal * 100) / 100,
        taxes: Math.round(taxes * 100) / 100,
        fees: Math.round(fees * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        taxBreakdown,
        notes: 'Payment received. Thank you for your business.',
        isEmailed: Math.random() > 0.3, // 70% chance of being emailed
        emailedAt: Math.random() > 0.3 ? new Date() : null,
      });

      const savedReceipt = await this.receiptRepository.save(receipt);
      receipts.push(savedReceipt);
    }

    console.log(`   ✓ Created ${receipts.length} receipts`);
    return receipts;
  }

  async clearAll() {
    console.log('🗑️  Clearing all data...');
    await this.receiptRepository.delete({});
    await this.invoiceRepository.delete({});
    await this.paymentTransactionRepository.delete({});
    await this.travelInsuranceRepository.delete({});
    await this.inFlightServiceRepository.delete({});
    await this.baggageRepository.delete({});
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

