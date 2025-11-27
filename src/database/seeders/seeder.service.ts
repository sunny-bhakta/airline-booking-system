import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Airport, AirportType } from '../../flights/entities/airport.entity';
import { SeatConfiguration, SeatClass } from '../../flights/entities/seat-configuration.entity';
import { Aircraft } from '../../flights/entities/aircraft.entity';
import { Route } from '../../flights/entities/route.entity';
import { Schedule } from '../../flights/entities/schedule.entity';
import { Flight, FlightStatus } from '../../flights/entities/flight.entity';

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
  ) {}

  async seedAll() {
    console.log('🌱 Starting database seeding...\n');

    const airports = await this.seedAirports();
    const seatConfigs = await this.seedSeatConfigurations();
    const aircrafts = await this.seedAircrafts(seatConfigs);
    const routes = await this.seedRoutes(airports);
    const schedules = await this.seedSchedules();
    const flights = await this.seedFlights(routes, schedules, aircrafts);

    console.log('\n✅ Database seeding completed!');
    console.log(`   - ${airports.length} Airports`);
    console.log(`   - ${seatConfigs.length} Seat Configurations`);
    console.log(`   - ${aircrafts.length} Aircraft`);
    console.log(`   - ${routes.length} Routes`);
    console.log(`   - ${schedules.length} Schedules`);
    console.log(`   - ${flights.length} Flights`);
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
        registrationNumber: 'N123AA',
        model: 'Boeing 737-800',
        manufacturer: 'Boeing',
        yearOfManufacture: 2018,
        seatConfigurationId: seatConfigs[0].id,
      },
      {
        registrationNumber: 'N456BB',
        model: 'Boeing 737-800',
        manufacturer: 'Boeing',
        yearOfManufacture: 2019,
        seatConfigurationId: seatConfigs[0].id,
      },
      {
        registrationNumber: 'N789CC',
        model: 'Airbus A320',
        manufacturer: 'Airbus',
        yearOfManufacture: 2020,
        seatConfigurationId: seatConfigs[1].id,
      },
      {
        registrationNumber: 'N321DD',
        model: 'Boeing 777-300ER',
        manufacturer: 'Boeing',
        yearOfManufacture: 2017,
        seatConfigurationId: seatConfigs[2].id,
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
      {
        originId: airports[0].id, // DEL
        destinationId: airports[2].id, // BLR
        distance: 1740,
        estimatedDuration: 150,
      },
      {
        originId: airports[2].id, // BLR
        destinationId: airports[3].id, // CCU
        distance: 1630,
        estimatedDuration: 145,
      },
      {
        originId: airports[0].id, // DEL
        destinationId: airports[4].id, // MAA
        distance: 1730,
        estimatedDuration: 150,
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
  ): Promise<Flight[]> {
    console.log('\n🛫 Seeding flights...');
    const today = new Date();
    const flightsData = [];

    // Create flights for the next 30 days
    for (let day = 0; day < 30; day++) {
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + day);

      // DEL to BOM flights
      flightsData.push({
        flightNumber: 'AI100',
        routeId: routes[0].id,
        scheduleId: schedules[0].id,
        aircraftId: aircrafts[0].id,
        departureDate: flightDate,
        gate: 'A12',
        terminal: '3',
        status: FlightStatus.SCHEDULED,
      });

      // BOM to DEL flights
      flightsData.push({
        flightNumber: 'AI101',
        routeId: routes[1].id,
        scheduleId: schedules[1].id,
        aircraftId: aircrafts[1].id,
        departureDate: flightDate,
        gate: 'B15',
        terminal: '2',
        status: FlightStatus.SCHEDULED,
      });

      // DEL to BLR flights
      if (day % 2 === 0) {
        flightsData.push({
          flightNumber: '6E200',
          routeId: routes[2].id,
          scheduleId: schedules[2].id,
          aircraftId: aircrafts[2].id,
          departureDate: flightDate,
          gate: 'C8',
          terminal: '3',
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
      const totalSeats = aircraft.seatConfiguration.totalSeats;

      const existingFlight = await this.flightRepository.findOne({
        where: {
          flightNumber: data.flightNumber,
          departureDate: data.departureDate,
        },
      });

      if (!existingFlight) {
        const newFlight = this.flightRepository.create({
          ...data,
          scheduledDepartureTime,
          scheduledArrivalTime,
          availableSeats: totalSeats,
          bookedSeats: 0,
        });
        const savedFlight = await this.flightRepository.save(newFlight);
        if (Array.isArray(savedFlight)) {
          flights.push(...savedFlight);
        } else {
          flights.push(savedFlight);
        }
      }
    }

    console.log(`   ✓ Created ${flights.length} flights for the next 30 days`);
    return flights;
  }

  async clearAll() {
    console.log('🗑️  Clearing all data...');
    await this.flightRepository.delete({});
    await this.routeRepository.delete({});
    await this.scheduleRepository.delete({});
    await this.aircraftRepository.delete({});
    await this.seatConfigRepository.delete({});
    await this.airportRepository.delete({});
    console.log('✅ All data cleared!');
  }
}

