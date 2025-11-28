# Flight Management Implementation Guide

## Overview

This document explains how **1.1 Flight Management** from the airline booking concepts has been implemented in the NestJS application.

## Architecture

The Flight Management module is implemented as a feature module in NestJS following Domain-Driven Design principles.

### Module Structure

```
src/flights/
├── entities/           # Database entities
│   ├── airport.entity.ts
│   ├── aircraft.entity.ts
│   ├── route.entity.ts
│   ├── schedule.entity.ts
│   ├── seat-configuration.entity.ts
│   ├── flight.entity.ts
│   └── index.ts
├── dto/                # Data Transfer Objects
│   ├── create-flight.dto.ts
│   ├── update-flight.dto.ts
│   ├── search-flights.dto.ts
│   ├── create-airport.dto.ts
│   ├── create-route.dto.ts
│   └── index.ts
├── flights.controller.ts
├── flights.service.ts
└── flights.module.ts
```

## Core Concepts Implementation

### 1. Flight Entity

The main entity representing an aircraft journey from origin to destination.

**Key Features:**
- Unique flight number per date
- Links to Route, Schedule, and Aircraft
- Tracks scheduled and actual departure/arrival times
- Manages seat availability
- Flight status tracking (scheduled, delayed, boarding, departed, arrived, cancelled)

**Fields:**
- `flightNumber`: Unique identifier (e.g., "AA123")
- `routeId`: Reference to Route entity
- `scheduleId`: Reference to Schedule entity
- `aircraftId`: Reference to Aircraft entity
- `departureDate`: Date of flight
- `scheduledDepartureTime` / `actualDepartureTime`
- `scheduledArrivalTime` / `actualArrivalTime`
- `status`: Current flight status
- `gate` / `terminal`: Boarding location
- `availableSeats` / `bookedSeats`: Seat inventory

### 2. Route Entity

Represents a path between two airports (origin → destination).

**Key Features:**
- Unique combination of origin and destination
- Stores distance and estimated duration
- Active/inactive route management

**Relationships:**
- Many-to-One with Airport (origin)
- Many-to-One with Airport (destination)
- One-to-Many with Flight

### 3. Schedule Entity

Timetable with departure/arrival times.

**Key Features:**
- Time-based schedule (departure/arrival times)
- Duration calculation
- Days of week operation
- Effective date range
- Reusable across multiple flights

**Fields:**
- `departureTime`: Time of day (e.g., "08:30:00")
- `arrivalTime`: Time of day (e.g., "11:45:00")
- `duration`: Flight duration in minutes
- `daysOfWeek`: Operating days (e.g., "1,2,3,4,5" for Mon-Fri)
- `effectiveFrom` / `effectiveTo`: Date range

### 4. Aircraft Entity

Physical plane with capacity and configuration.

**Key Features:**
- Registration number (unique identifier)
- Model and manufacturer information
- Links to seat configuration
- Active/inactive status

**Relationships:**
- Many-to-One with SeatConfiguration
- One-to-Many with Flight

### 5. Seat Configuration Entity

Layout definition for aircraft (economy, business, first class).

**Key Features:**
- JSON-based layout definition
- Class-based seat allocation
- Total seat count calculation
- Reusable across multiple aircraft

**Structure:**
```json
{
  "rows": 30,
  "seatsPerRow": 6,
  "classes": [
    {
      "class": "first",
      "startRow": 1,
      "endRow": 2,
      "seatsPerRow": 4,
      "seatMap": ["A", "B", "C", "D"]
    },
    {
      "class": "business",
      "startRow": 3,
      "endRow": 8,
      "seatsPerRow": 6,
      "seatMap": ["A", "B", "C", "D", "E", "F"]
    }
  ]
}
```

### 6. Airport Entity

Airport information with IATA/ICAO codes.

**Key Features:**
- IATA code (3 letters, e.g., "JFK")
- ICAO code (4 letters, e.g., "KJFK")
- Location data (city, country, coordinates)
- Timezone information
- Domestic/International classification

## API Endpoints

### Flight Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/flights` | Create a new flight |
| `GET` | `/flights` | Get all flights |
| `GET` | `/flights/:id` | Get flight by ID |
| `GET` | `/flights/search` | Search flights by origin, destination, date |
| `GET` | `/flights/status/:status` | Get flights by status |
| `GET` | `/flights/date/:date` | Get flights by date |
| `PATCH` | `/flights/:id` | Update flight |
| `PATCH` | `/flights/:id/status` | Update flight status |
| `DELETE` | `/flights/:id` | Delete flight |

### Example Requests

#### Create Flight
```json
POST /flights
{
  "flightNumber": "AA123",
  "routeId": "uuid-here",
  "scheduleId": "uuid-here",
  "aircraftId": "uuid-here",
  "departureDate": "2024-12-25",
  "gate": "A12",
  "terminal": "1"
}
```

#### Search Flights
```
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2
```

#### Update Flight Status
```json
PATCH /flights/:id/status
{
  "status": "delayed"
}
```

## Business Logic

### Flight Creation
1. Validates route, schedule, and aircraft exist
2. Checks for duplicate flight numbers on same date
3. Calculates scheduled departure/arrival times from schedule
4. Initializes seat availability from aircraft configuration
5. Sets default status to "scheduled"

### Flight Search
1. Finds airports by IATA codes
2. Locates route between airports
3. Filters by departure date
4. Checks seat availability for passenger count
5. Supports status filtering
6. Implements pagination

### Seat Management
- Automatically calculates available seats from total capacity minus booked seats
- Prevents overbooking (validates booked seats don't exceed capacity)
- Updates seat counts when bookings change

### Status Management
- Tracks flight lifecycle: scheduled → boarding → departed → arrived
- Supports delays and cancellations
- Updates actual times when status changes

## Database Schema

The implementation uses TypeORM with SQLite (can be easily switched to PostgreSQL/MySQL).

**Relationships:**
- Flight → Route (Many-to-One)
- Flight → Schedule (Many-to-One)
- Flight → Aircraft (Many-to-One)
- Route → Airport (Many-to-One, twice: origin & destination)
- Aircraft → SeatConfiguration (Many-to-One)

## Usage Example

### Setting Up Data

1. **Create Airports:**
```typescript
// You'll need to create airports first
POST /airports (if you create an airports controller)
{
  "iataCode": "JFK",
  "name": "John F. Kennedy International Airport",
  "city": "New York",
  "country": "USA"
}
```

2. **Create Route:**
```typescript
POST /routes
{
  "originId": "jfk-airport-uuid",
  "destinationId": "lax-airport-uuid",
  "distance": 3944,
  "estimatedDuration": 360
}
```

3. **Create Schedule:**
```typescript
// Create schedule template
{
  "departureTime": "08:30:00",
  "arrivalTime": "14:30:00",
  "duration": 360,
  "daysOfWeek": "1,2,3,4,5"
}
```

4. **Create Aircraft with Seat Configuration:**
```typescript
// First create seat configuration
// Then create aircraft linking to it
```

5. **Create Flight:**
```typescript
POST /flights
{
  "flightNumber": "AA123",
  "routeId": "route-uuid",
  "scheduleId": "schedule-uuid",
  "aircraftId": "aircraft-uuid",
  "departureDate": "2024-12-25"
}
```

## Next Steps

To complete the Flight Management system, consider adding:

1. **Airport Controller/Service** - CRUD operations for airports
2. **Route Controller/Service** - Route management
3. **Schedule Controller/Service** - Schedule templates
4. **Aircraft Controller/Service** - Aircraft fleet management
5. **Seat Configuration Controller/Service** - Seat layout management
6. **Flight Status Automation** - Auto-update status based on time
7. **Flight Notifications** - Status change notifications
8. **Flight Analytics** - Reporting and statistics

## Testing

Run the application:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/flights`

## Validation

All DTOs include validation using `class-validator`:
- Required fields validation
- Type checking
- Format validation (dates, UUIDs, etc.)
- Business rule validation (e.g., seat capacity)

## Error Handling

The service includes proper error handling:
- `NotFoundException` - When entities don't exist
- `BadRequestException` - For invalid operations (duplicates, overbooking)
- Validation errors from DTOs

