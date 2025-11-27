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

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
    @InjectRepository(SeatConfiguration)
    private seatConfigRepository: Repository<SeatConfiguration>,
    @InjectRepository(Aircraft)
    private aircraftRepository: Repository<Aircraft>,
    @InjectRepository(Route)
    private routeRepository: Repository<Route>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(Flight)
    private flightRepository: Repository<Flight>,
    @InjectRepository(Terminal)
    private terminalRepository: Repository<Terminal>,
    @InjectRepository(Gate)
    private gateRepository: Repository<Gate>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
  ) {}

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

  async clearAll() {
    console.log('🗑️  Clearing all data...');
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

