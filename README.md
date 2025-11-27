# Airline Booking System - NestJS Project

A NestJS-based airline booking system backend application.

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## Database Seeding

### Seed All Data
```bash
npm run seed
```

This creates:
- 5 Airports (JFK, LAX, ORD, DFW, MIA)
- 3 Seat Configurations
- 4 Aircraft
- 5 Routes
- 4 Schedules
- ~75 Flights (for next 30 days)

### Clear All Data
```bash
npm run seed:clear
```

See [Seeding Guide](docs/SEEDING-GUIDE.md) for details.

## Project Structure

```
src/
├── flights/              # Flight management module
│   ├── entities/         # Database entities
│   ├── dto/             # Data Transfer Objects
│   ├── flights.controller.ts
│   ├── flights.service.ts
│   └── flights.module.ts
├── bookings/            # Booking & reservation module
│   ├── entities/         # Database entities
│   ├── dto/             # Data Transfer Objects
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   └── bookings.module.ts
├── database/            # Database utilities
│   └── seeders/         # Database seeding
└── main.ts              # Application entry point
```

## Available Scripts

- `npm run build` - Build the project
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with watch
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests
- `npm run seed` - Seed database with test data
- `npm run seed:clear` - Clear all database data

## API Endpoints

### App
- `GET /` - Welcome message

### Flights
- `POST /flights` - Create flight
- `GET /flights` - Get all flights
- `GET /flights/search` - Search flights
- `GET /flights/:id` - Get flight by ID
- `GET /flights/status/:status` - Get flights by status
- `GET /flights/date/:date` - Get flights by date
- `PATCH /flights/:id` - Update flight
- `PATCH /flights/:id/status` - Update flight status
- `DELETE /flights/:id` - Delete flight

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings` - Get all bookings
- `GET /bookings/:id` - Get booking by ID
- `GET /bookings/pnr/:pnr` - Get booking by PNR
- `GET /bookings/search` - Search bookings
- `GET /bookings/status/:status` - Get bookings by status
- `PATCH /bookings/:id` - Update booking
- `PATCH /bookings/:id/status` - Update booking status
- `POST /bookings/:id/tickets` - Generate tickets
- `POST /bookings/:id/seats` - Assign seat
- `GET /bookings/:id/seats` - Get seat assignments
- `DELETE /bookings/:id/seats/:seatAssignmentId` - Remove seat assignment
- `DELETE /bookings/:id` - Delete booking

## API Documentation

- **Swagger UI**: `http://localhost:3000/api`
- Interactive API documentation with "Try it out" feature

## Testing

See [API Testing Guide](docs/API-TESTING-GUIDE.md) for:
- Swagger UI testing
- Postman collection
- REST Client examples
- cURL commands

## Documentation

📚 **Start here:** [Documentation Index](docs/README.md) - Complete guide to all documentation

### Implementation Guides
- [Flight Management Implementation](docs/flight-management-implementation.md) - Flight module details
- [Booking Management Implementation](docs/booking-management-implementation.md) - Booking module details

### Setup & Guides
- [Seeding Guide](docs/SEEDING-GUIDE.md) - Database seeding instructions
- [API Testing Guide](docs/API-TESTING-GUIDE.md) - How to test the API

### Reference
- [Airline Booking Concepts](docs/airline-booking-concepts.md) - Complete domain concepts

## Technologies

- NestJS 10.x
- TypeScript
- Express.js
- TypeORM
- SQLite
- Swagger/OpenAPI

## Implementation Status

Based on the airline booking concepts document:

1. ✅ **Flight Module** - Flight search, availability, schedules
2. ✅ **Booking Module** - Reservation management, PNR generation, tickets, seat assignment
3. 🚧 **User Module** - Authentication, user profiles (Planned)
4. 🚧 **Payment Module** - Payment processing, invoicing (Planned)
5. 🚧 **Check-in Module** - Online check-in, boarding passes (Planned)

## Next Steps

To continue building the system:

1. **Pricing & Fare Module** - Dynamic pricing, fare rules, taxes
2. **User Management** - Authentication, authorization, profiles
3. **Payment Integration** - Payment gateways, transactions, refunds
4. **Check-in System** - Online check-in, boarding passes
5. **Notifications** - Email, SMS, push notifications
6. **Ancillary Services** - Baggage, meals, insurance
7. **Loyalty Program** - Frequent flyer points, tiers, benefits
