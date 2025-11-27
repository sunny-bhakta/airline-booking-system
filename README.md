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

- [Flight Management Implementation](docs/flight-management-implementation.md)
- [Seeding Guide](docs/SEEDING-GUIDE.md)
- [API Testing Guide](docs/API-TESTING-GUIDE.md)
- [Airline Booking Concepts](docs/airline-booking-concepts.md)

## Technologies

- NestJS 10.x
- TypeScript
- Express.js
- TypeORM
- SQLite
- Swagger/OpenAPI

## Next Steps

Based on the airline booking concepts document, you can start building:

1. ✅ **Flight Module** - Flight search, availability, schedules
2. **Booking Module** - Reservation management, PNR generation
3. **User Module** - Authentication, user profiles
4. **Payment Module** - Payment processing, invoicing
5. **Check-in Module** - Online check-in, boarding passes
