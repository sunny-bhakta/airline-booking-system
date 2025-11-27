# Airport, Terminal, Gate, and Timezone Implementation

This document describes the implementation of Airport, Terminal, Gate, and Timezone concepts as specified in the airline booking system requirements.

## Overview

The system implements a hierarchical structure for airport locations:
- **Airport** → Contains multiple **Terminals**
- **Terminal** → Contains multiple **Gates**
- **Gate** → Assigned to **Flights** for boarding

## 1. Airport Entity

### Implementation Status: ✅ Fully Implemented

The Airport entity represents an airport location with IATA/ICAO codes, name, city, country, and timezone information.

### Entity Structure

**File**: `src/flights/entities/airport.entity.ts`

```typescript
@Entity('airports')
export class Airport {
  id: string;                    // UUID primary key
  iataCode: string;              // 3-letter IATA code (e.g., 'JFK', 'LAX')
  icaoCode: string;             // 4-letter ICAO code (e.g., 'KJFK', 'KLAX')
  name: string;                  // Full airport name
  city: string;                 // City name
  country: string;               // Country name
  latitude: number;              // Geographic latitude
  longitude: number;             // Geographic longitude
  timezone: string;              // IANA timezone (e.g., 'America/New_York')
  type: AirportType;             // 'domestic' or 'international'
  terminals: Terminal[];        // One-to-many relationship with terminals
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Features

- **IATA Code**: 3-letter unique identifier (e.g., JFK, LAX, DEL)
- **ICAO Code**: 4-letter unique identifier (e.g., KJFK, KLAX, VIDP)
- **Timezone**: IANA timezone string for accurate time calculations
- **Geographic Coordinates**: Latitude and longitude for mapping
- **Type**: Domestic or International classification

### API Endpoints

The Airport entity is managed through the existing flights module. Airport creation and management should be done through the appropriate endpoints.

### Example Usage

```typescript
// Create an airport
const airport = {
  iataCode: 'JFK',
  icaoCode: 'KJFK',
  name: 'John F. Kennedy International Airport',
  city: 'New York',
  country: 'United States',
  latitude: 40.6413,
  longitude: -73.7781,
  timezone: 'America/New_York',
  type: AirportType.INTERNATIONAL
};
```

## 2. Terminal Entity

### Implementation Status: ✅ Fully Implemented

The Terminal entity represents a building within an airport that contains multiple gates.

### Entity Structure

**File**: `src/flights/entities/terminal.entity.ts`

```typescript
@Entity('terminals')
export class Terminal {
  id: string;                    // UUID primary key
  airportId: string;             // Foreign key to Airport
  airport: Airport;              // Many-to-one relationship
  name: string;                  // Terminal name (e.g., 'Terminal 1', 'Terminal A')
  description: string;          // Optional description
  isActive: boolean;             // Active status
  gates: Gate[];                // One-to-many relationship with gates
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Features

- **Belongs to Airport**: Each terminal is associated with a specific airport
- **Unique Name per Airport**: Terminal names must be unique within an airport
- **Active Status**: Can be deactivated without deletion
- **Contains Gates**: One terminal can have multiple gates

### API Endpoints

**Base URL**: `/terminals`

- `POST /terminals` - Create a new terminal
- `GET /terminals` - Get all terminals (optional query: `?airportId=<uuid>`)
- `GET /terminals/:id` - Get a specific terminal
- `PATCH /terminals/:id` - Update a terminal
- `DELETE /terminals/:id` - Delete a terminal

### Example Usage

```typescript
// Create a terminal
const terminal = {
  airportId: 'airport-uuid',
  name: 'Terminal 1',
  description: 'International Terminal',
  isActive: true
};

// Get all terminals for an airport
GET /terminals?airportId=airport-uuid
```

### DTOs

**CreateTerminalDto** (`src/flights/dto/create-terminal.dto.ts`):
- `airportId`: UUID (required)
- `name`: string (required)
- `description`: string (optional)
- `isActive`: boolean (optional, default: true)

**UpdateTerminalDto** (`src/flights/dto/update-terminal.dto.ts`):
- Extends `PartialType(CreateTerminalDto)`

## 3. Gate Entity

### Implementation Status: ✅ Fully Implemented

The Gate entity represents a boarding location within a terminal.

### Entity Structure

**File**: `src/flights/entities/gate.entity.ts`

```typescript
@Entity('gates')
export class Gate {
  id: string;                    // UUID primary key
  terminalId: string;           // Foreign key to Terminal
  terminal: Terminal;            // Many-to-one relationship
  number: string;                // Gate number (e.g., 'A12', 'B5', 'Gate 23')
  description: string;           // Optional description
  isActive: boolean;             // Active status
  flights: Flight[];             // One-to-many relationship with flights
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Features

- **Belongs to Terminal**: Each gate is associated with a specific terminal
- **Unique Number per Terminal**: Gate numbers must be unique within a terminal
- **Active Status**: Can be deactivated without deletion
- **Assigned to Flights**: Gates are assigned to flights for boarding

### API Endpoints

**Base URL**: `/gates`

- `POST /gates` - Create a new gate
- `GET /gates` - Get all gates (optional query: `?terminalId=<uuid>`)
- `GET /gates/:id` - Get a specific gate
- `PATCH /gates/:id` - Update a gate
- `DELETE /gates/:id` - Delete a gate

### Example Usage

```typescript
// Create a gate
const gate = {
  terminalId: 'terminal-uuid',
  number: 'A12',
  description: 'Gate A12 - International Departures',
  isActive: true
};

// Get all gates for a terminal
GET /gates?terminalId=terminal-uuid
```

### DTOs

**CreateGateDto** (`src/flights/dto/create-gate.dto.ts`):
- `terminalId`: UUID (required)
- `number`: string (required)
- `description`: string (optional)
- `isActive`: boolean (optional, default: true)

**UpdateGateDto** (`src/flights/dto/update-gate.dto.ts`):
- Extends `PartialType(CreateGateDto)`

## 4. Timezone Implementation

### Implementation Status: ✅ Fully Implemented

Timezone is implemented as a field within the Airport entity to support accurate time calculations for flight schedules.

### Key Features

- **IANA Timezone Format**: Uses standard IANA timezone identifiers (e.g., 'America/New_York', 'Asia/Kolkata')
- **Automatic Conversion**: Enables accurate conversion between local airport time and UTC
- **Flight Scheduling**: Critical for calculating accurate departure and arrival times across timezones

### Usage in Flight Operations

When scheduling flights:
1. Departure time is stored in the airport's local timezone
2. Arrival time accounts for timezone differences
3. System can convert between timezones for display purposes

### Example Timezones

```typescript
// Common airport timezones
'America/New_York'    // JFK, LGA, EWR
'America/Los_Angeles' // LAX, SFO
'Europe/London'       // LHR, LGW
'Asia/Kolkata'        // DEL, BOM, BLR
'Asia/Tokyo'          // NRT, HND
```

## 5. Flight Integration

### Updated Flight Entity

The Flight entity has been updated to use the Gate relationship instead of simple string fields.

**Before**:
```typescript
gate: string;        // Simple string
terminal: string;    // Simple string
```

**After**:
```typescript
gateId: string;      // Foreign key to Gate
gate: Gate;          // Many-to-one relationship (includes terminal and airport)
```

### Benefits

1. **Data Integrity**: Ensures gates exist before assignment
2. **Rich Information**: Access to terminal and airport information through relationships
3. **Validation**: Prevents invalid gate assignments
4. **Consistency**: Gate information is centralized and consistent

### Updated DTOs

**CreateFlightDto**:
- `gateId`: UUID (optional) - replaces `gate` and `terminal` string fields

**UpdateFlightDto**:
- `gateId`: UUID (optional) - replaces `gate` and `terminal` string fields

## 6. Database Schema

### Relationships

```
Airport (1) ──→ (N) Terminal
Terminal (1) ──→ (N) Gate
Gate (1) ──→ (N) Flight
```

### Indexes

- **Airports**: Unique index on `iataCode` and `icaoCode`
- **Terminals**: Unique composite index on `(airportId, name)`
- **Gates**: Unique composite index on `(terminalId, number)`

## 7. Services

### TerminalsService

**File**: `src/flights/terminals.service.ts`

- `create()`: Creates a new terminal with validation
- `findAll()`: Retrieves all terminals (optionally filtered by airport)
- `findOne()`: Retrieves a specific terminal with relations
- `update()`: Updates terminal information
- `remove()`: Deletes a terminal

### GatesService

**File**: `src/flights/gates.service.ts`

- `create()`: Creates a new gate with validation
- `findAll()`: Retrieves all gates (optionally filtered by terminal)
- `findOne()`: Retrieves a specific gate with relations
- `update()`: Updates gate information
- `remove()`: Deletes a gate

## 8. Controllers

### TerminalsController

**File**: `src/flights/terminals.controller.ts`

- RESTful endpoints for terminal management
- Query parameter support for filtering by airport

### GatesController

**File**: `src/flights/gates.controller.ts`

- RESTful endpoints for gate management
- Query parameter support for filtering by terminal

## 9. Migration Notes

### Breaking Changes

If you have existing data with `gate` and `terminal` as string fields in the Flight table:

1. **Create Terminals**: Create terminal entities for each unique terminal name
2. **Create Gates**: Create gate entities for each unique gate number
3. **Migrate Data**: Update Flight records to use `gateId` instead of string fields
4. **Remove Old Columns**: Drop the old `gate` and `terminal` string columns

### Migration Script Example

```sql
-- Example migration steps (pseudo-code)
-- 1. Create terminals from existing flight data
-- 2. Create gates from existing flight data
-- 3. Update flights to reference gate IDs
-- 4. Drop old columns
```

## 10. Best Practices

### Creating Airport Infrastructure

1. **Create Airport First**: Always create the airport before terminals
2. **Create Terminals**: Create terminals for the airport
3. **Create Gates**: Create gates within terminals
4. **Assign to Flights**: Assign gates to flights during flight creation or update

### Naming Conventions

- **Terminals**: Use descriptive names (e.g., "Terminal 1", "International Terminal", "Terminal A")
- **Gates**: Use consistent numbering (e.g., "A12", "B5", "Gate 23")

### Validation

- Terminal names must be unique within an airport
- Gate numbers must be unique within a terminal
- Gates can only be assigned to flights if they exist and are active

## 11. Example Workflow

### Setting Up Airport Infrastructure

```typescript
// 1. Create Airport
const airport = await airportService.create({
  iataCode: 'JFK',
  icaoCode: 'KJFK',
  name: 'John F. Kennedy International Airport',
  city: 'New York',
  country: 'United States',
  timezone: 'America/New_York',
  type: AirportType.INTERNATIONAL
});

// 2. Create Terminal
const terminal = await terminalsService.create({
  airportId: airport.id,
  name: 'Terminal 1',
  description: 'International Terminal',
  isActive: true
});

// 3. Create Gates
const gate1 = await gatesService.create({
  terminalId: terminal.id,
  number: 'A12',
  description: 'Gate A12 - International Departures',
  isActive: true
});

const gate2 = await gatesService.create({
  terminalId: terminal.id,
  number: 'A13',
  description: 'Gate A13 - International Departures',
  isActive: true
});

// 4. Assign Gate to Flight
const flight = await flightsService.create({
  flightNumber: 'AA100',
  routeId: route.id,
  scheduleId: schedule.id,
  aircraftId: aircraft.id,
  departureDate: '2024-01-15',
  gateId: gate1.id
});
```

## 12. Testing

### Unit Tests

Test cases should cover:
- Terminal creation with duplicate name validation
- Gate creation with duplicate number validation
- Flight assignment with valid/invalid gate IDs
- Timezone conversion accuracy

### Integration Tests

Test cases should cover:
- Complete workflow: Airport → Terminal → Gate → Flight
- Query filtering by airport and terminal
- Relationship loading and eager fetching

## Summary

✅ **Airport**: Fully implemented with IATA/ICAO codes, name, city, country, and timezone  
✅ **Terminal**: Fully implemented as entity with relationship to Airport  
✅ **Gate**: Fully implemented as entity with relationship to Terminal  
✅ **Timezone**: Fully implemented as field in Airport entity  

All concepts from section 1.2 of the requirements document have been implemented with proper relationships, validation, and API endpoints.

