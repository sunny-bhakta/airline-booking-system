# Search & Availability Implementation Guide

## Overview

This document explains how **3. Search & Availability** from the airline booking concepts has been implemented in the NestJS application. This includes flight search capabilities, advanced filtering, and real-time availability management.

## Architecture

The Search & Availability functionality is implemented as a service within the Flights module, providing comprehensive search capabilities and availability management.

### Module Structure

```
src/flights/
├── services/
│   └── search-availability.service.ts    # Search and availability logic
├── dto/
│   ├── advanced-search-flights.dto.ts    # Advanced search parameters
│   ├── check-availability.dto.ts         # Availability check DTOs
│   └── search-flights.dto.ts             # Basic search (existing)
└── flights.controller.ts                 # Enhanced with new endpoints
```

## Core Concepts Implementation

### 3.1 Flight Search

The system supports multiple search types:

#### One-Way Search
- Single journey from origin to destination
- Basic search endpoint: `GET /flights/search`
- Advanced search endpoint: `GET /flights/search/advanced`

#### Round-Trip Search
- Return journey with outbound and return flights
- Supports flexible return dates
- Returns both outbound and return flight options

#### Multi-City Search
- Multiple destinations in a single trip
- Each segment can have different origin, destination, and date
- Endpoint: `POST /flights/search/multi-city`

#### Flexible Dates
- Date range search instead of specific date
- `departureDateFrom` and `departureDateTo` parameters
- Useful for finding cheapest flights within a date range

#### Nearby Airports
- Includes alternative airports within a specified radius
- Configurable radius (default: 50km)
- Uses Haversine formula for distance calculation
- Helps find more flight options

### 3.2 Search Filters

The advanced search supports comprehensive filtering:

#### Price Range Filter
- `minPrice`: Minimum fare price
- `maxPrice`: Maximum fare price
- Filters based on fare class pricing
- Integrates with pricing module

#### Time Filters
- `departureTimeFrom` / `departureTimeTo`: Filter by departure time window
- `arrivalTimeFrom` / `arrivalTimeTo`: Filter by arrival time window
- Time format: "HH:MM" (e.g., "06:00", "18:00")

#### Stops Filter
- `non-stop`: Direct flights only
- `1-stop`: Flights with one stop
- `2+ stops`: Flights with two or more stops
- `any`: All flights (default)

**Note:** Current implementation supports direct flights. Multi-stop flight support requires route chaining logic (future enhancement).

#### Flight Duration Filter
- `maxDuration`: Maximum flight duration in minutes
- Filters based on schedule duration
- Helps find shorter flights

#### Aircraft Filters
- `aircraftModel`: Filter by aircraft model (partial match)
- `aircraftManufacturer`: Filter by aircraft manufacturer (exact match)
- Useful for passengers with aircraft preferences

#### Fare Class Filter
- Filter by fare class: Economy, Premium Economy, Business, First
- Returns only flights with available seats in specified class

#### Status Filter
- Filter by flight status (scheduled, delayed, boarding, etc.)
- Default: Excludes cancelled flights

### 3.3 Availability Engine

#### Real-Time Seat Availability
- Checks current seat availability for flights
- Endpoint: `POST /flights/availability/check`
- Returns:
  - Available seats count
  - Whether requested seats are available
  - Fare class specific availability
  - Overbooking status
  - Waitlist availability

#### Inventory Management
- Tracks available vs. booked seats
- Updates in real-time as bookings are made
- Prevents overbooking beyond configured limits
- Integrates with booking system

#### Overbooking Policies
- Configurable overbooking limit (default: 10% over capacity)
- Calculates overbook capacity: `totalCapacity * 1.1`
- Prevents bookings beyond overbook limit
- Returns `canOverbook` flag in availability checks

#### Waitlist Management
- Waitlist available when flight is full but not over overbook limit
- Returns `waitlistAvailable` flag
- Future enhancement: Full waitlist queue management

## API Endpoints

### Basic Search

#### GET /flights/search
Basic flight search with essential parameters.

**Query Parameters:**
- `origin` (required): Origin airport IATA code
- `destination` (required): Destination airport IATA code
- `departureDate` (required): Departure date (YYYY-MM-DD)
- `returnDate` (optional): Return date for round-trip
- `passengers` (optional): Number of passengers (default: 1)
- `status` (optional): Filter by flight status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example Request:**
```
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2
```

**Response:**
```json
{
  "flights": [...],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### Advanced Search

#### GET /flights/search/advanced
Advanced flight search with comprehensive filters.

**Query Parameters:**

**Basic Parameters:**
- `origin` (required): Origin airport IATA code
- `destination` (required): Destination airport IATA code
- `tripType` (optional): `one-way`, `round-trip`, `multi-city` (default: `one-way`)
- `passengers` (optional): Number of passengers (default: 1)

**Date Parameters:**
- `departureDate`: Specific departure date (YYYY-MM-DD)
- `departureDateFrom`: Start of departure date range
- `departureDateTo`: End of departure date range
- `returnDate`: Specific return date (for round-trip)
- `returnDateFrom`: Start of return date range
- `returnDateTo`: End of return date range

**Filter Parameters:**
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `departureTimeFrom`: Earliest departure time (HH:MM)
- `departureTimeTo`: Latest departure time (HH:MM)
- `arrivalTimeFrom`: Earliest arrival time (HH:MM)
- `arrivalTimeTo`: Latest arrival time (HH:MM)
- `stops`: Stops filter (`non-stop`, `1-stop`, `2+ stops`, `any`)
- `maxDuration`: Maximum flight duration in minutes
- `aircraftModel`: Aircraft model filter (partial match)
- `aircraftManufacturer`: Aircraft manufacturer filter
- `fareClass`: Filter by fare class
- `status`: Filter by flight status
- `includeNearbyAirports`: Include nearby airports (default: false)
- `nearbyAirportsRadius`: Radius in kilometers (default: 50)

**Pagination & Sorting:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (`price`, `duration`, `departureTime`, `arrivalTime`)
- `sortOrder`: Sort order (`asc`, `desc`)

**Example Request:**
```
GET /flights/search/advanced?origin=JFK&destination=LAX&departureDateFrom=2024-12-20&departureDateTo=2024-12-30&minPrice=200&maxPrice=500&departureTimeFrom=06:00&departureTimeTo=18:00&maxDuration=360&includeNearbyAirports=true
```

**Response:**
```json
{
  "flights": [...],
  "returnFlights": [...],  // For round-trip
  "total": 25,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

### Multi-City Search

#### POST /flights/search/multi-city
Search for multi-city trips with multiple segments.

**Request Body:**
```json
{
  "segments": [
    {
      "origin": "JFK",
      "destination": "LAX",
      "departureDate": "2024-12-20"
    },
    {
      "origin": "LAX",
      "destination": "SFO",
      "departureDate": "2024-12-25"
    },
    {
      "origin": "SFO",
      "destination": "JFK",
      "departureDate": "2024-12-30"
    }
  ],
  "passengers": 2,
  "page": 1,
  "limit": 10
}
```

**Response:**
```json
[
  {
    "flights": [...],  // Segment 1 results
    "total": 10,
    "page": 1,
    "limit": 10
  },
  {
    "flights": [...],  // Segment 2 results
    "total": 8,
    "page": 1,
    "limit": 10
  },
  {
    "flights": [...],  // Segment 3 results
    "total": 12,
    "page": 1,
    "limit": 10
  }
]
```

### Availability Checks

#### POST /flights/availability/check
Check real-time seat availability for a specific flight.

**Request Body:**
```json
{
  "flightId": "uuid-here",
  "passengers": 2,
  "fareClass": "Economy"  // Optional
}
```

**Response:**
```json
{
  "flightId": "uuid-here",
  "isAvailable": true,
  "availableSeats": 15,
  "requestedSeats": 2,
  "fareClass": "Economy",
  "canOverbook": true,
  "waitlistAvailable": false,
  "message": "Seats available"
}
```

#### POST /flights/availability/check-multiple
Check availability for multiple flights at once.

**Request Body:**
```json
{
  "flightIds": ["uuid-1", "uuid-2", "uuid-3"],
  "passengers": 2,
  "fareClass": "Business"  // Optional
}
```

**Response:**
```json
[
  {
    "flightId": "uuid-1",
    "isAvailable": true,
    "availableSeats": 10,
    "requestedSeats": 2,
    "fareClass": "Business",
    "canOverbook": true,
    "waitlistAvailable": false,
    "message": "Seats available"
  },
  {
    "flightId": "uuid-2",
    "isAvailable": false,
    "availableSeats": 1,
    "requestedSeats": 2,
    "fareClass": "Business",
    "canOverbook": true,
    "waitlistAvailable": true,
    "message": "Flight is full, but waitlist is available"
  },
  {
    "flightId": "uuid-3",
    "isAvailable": false,
    "availableSeats": 0,
    "requestedSeats": 2,
    "fareClass": "Business",
    "canOverbook": false,
    "waitlistAvailable": false,
    "message": "Flight is fully booked"
  }
]
```

## Business Logic

### Search Algorithm

1. **Airport Resolution**
   - Find origin and destination airports by IATA code
   - If `includeNearbyAirports` is true, find airports within radius
   - Calculate distances using Haversine formula

2. **Route Finding**
   - Find all routes between origin and destination airports
   - Supports multiple routes when nearby airports are included
   - Only active routes are considered

3. **Flight Filtering**
   - Filter by route IDs
   - Apply date filters (specific date or date range)
   - Filter by seat availability
   - Apply time filters (departure/arrival windows)
   - Filter by duration, aircraft, status
   - Apply price filters (requires fare lookup)

4. **Sorting**
   - Sort by price, duration, departure time, or arrival time
   - Ascending or descending order

5. **Pagination**
   - Apply pagination to results
   - Return total count and pagination metadata

### Availability Algorithm

1. **Flight Lookup**
   - Retrieve flight with aircraft and seat configuration
   - Calculate total capacity from seat configuration

2. **Seat Availability Check**
   - Check overall available seats
   - If fare class specified, check fare class specific availability
   - Compare with requested passenger count

3. **Overbooking Calculation**
   - Calculate overbook limit: `totalCapacity * 1.1`
   - Check if booking would exceed overbook limit
   - Return `canOverbook` flag

4. **Waitlist Determination**
   - Waitlist available if:
     - Flight is full (not enough seats)
     - But not over overbook limit
   - Return `waitlistAvailable` flag

### Nearby Airports Algorithm

1. **Distance Calculation**
   - Use Haversine formula to calculate great-circle distance
   - Formula accounts for Earth's curvature
   - Returns distance in kilometers

2. **Airport Filtering**
   - Filter airports within specified radius
   - Exclude the original airport
   - Only include airports with valid coordinates

3. **Route Expansion**
   - Find routes from/to nearby airports
   - Expands search results significantly

## Data Transfer Objects

### AdvancedSearchFlightsDto

Comprehensive DTO for advanced search with all filter options.

**Key Fields:**
- Basic: `origin`, `destination`, `tripType`, `passengers`
- Dates: `departureDate`, `departureDateFrom`, `departureDateTo`, `returnDate`, etc.
- Filters: `minPrice`, `maxPrice`, `departureTimeFrom`, `departureTimeTo`, etc.
- Pagination: `page`, `limit`, `sortBy`, `sortOrder`

### CheckAvailabilityDto

DTO for availability checks.

**Key Fields:**
- `flightId`: Flight UUID
- `passengers`: Number of passengers
- `fareClass`: Optional fare class filter

### AvailabilityResult

Response DTO for availability checks.

**Key Fields:**
- `isAvailable`: Whether seats are available
- `availableSeats`: Number of available seats
- `requestedSeats`: Number of requested seats
- `canOverbook`: Whether overbooking is possible
- `waitlistAvailable`: Whether waitlist is available
- `message`: Human-readable status message

## Integration Points

### Pricing Module
- Fares are queried for price filtering
- Fare class availability is checked
- Price-based sorting requires fare data

### Booking Module
- Availability is checked before booking creation
- Seat counts are updated after booking
- Overbooking policies are enforced

### Flight Management
- Flight entities provide core search data
- Routes connect origin and destination
- Schedules provide duration and timing
- Aircraft provide capacity information

## Performance Considerations

### Query Optimization
- Indexes on route IDs, departure dates, and status
- Efficient joins with proper relations
- Pagination to limit result sets

### Caching Opportunities
- Cache route lookups (rarely changes)
- Cache airport coordinates (static data)
- Cache availability for frequently searched flights

### Scalability
- Search queries can be optimized with database indexes
- Consider read replicas for search-heavy workloads
- Price filtering may require optimization for large datasets

## Future Enhancements

### Multi-Stop Flights
- Implement route chaining for connecting flights
- Calculate total duration including layovers
- Filter by layover duration and airport

### Advanced Waitlist
- Full waitlist queue management
- Automatic notification when seats become available
- Priority-based waitlist ordering

### Search Caching
- Cache popular search results
- Invalidate cache on flight updates
- Redis-based caching layer

### Price Sorting
- Join with fares table for accurate price sorting
- Consider all fare classes in price comparison
- Display price range for each flight

### Search Analytics
- Track popular search routes
- Monitor search performance
- Identify search patterns for optimization

## Testing Considerations

### Unit Tests
- Test search filters individually
- Test availability calculations
- Test nearby airport distance calculations
- Test overbooking logic

### Integration Tests
- Test end-to-end search flow
- Test availability checks with bookings
- Test multi-city search
- Test round-trip search

### Performance Tests
- Test search with large datasets
- Test availability checks under load
- Measure query performance
- Test pagination efficiency

## Error Handling

### Common Errors
- **404**: Airport not found
- **400**: Invalid search parameters
- **404**: Flight not found (availability check)
- **400**: Invalid date ranges
- **400**: Invalid time formats

### Validation
- IATA codes must be 3 characters
- Dates must be valid ISO date strings
- Times must be in HH:MM format
- Price values must be positive numbers
- Passenger count must be at least 1

## Example Usage Scenarios

### Scenario 1: Basic One-Way Search
```
User wants to find flights from New York to Los Angeles on December 25th for 2 passengers.
```
**Request:**
```
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2
```

### Scenario 2: Flexible Date Search with Price Filter
```
User wants cheapest flights between December 20-30, under $500, departing between 6 AM and 6 PM.
```
**Request:**
```
GET /flights/search/advanced?origin=JFK&destination=LAX&departureDateFrom=2024-12-20&departureDateTo=2024-12-30&maxPrice=500&departureTimeFrom=06:00&departureTimeTo=18:00&sortBy=price&sortOrder=asc
```

### Scenario 3: Round-Trip with Nearby Airports
```
User wants round-trip flights from New York area to Los Angeles area, including nearby airports.
```
**Request:**
```
GET /flights/search/advanced?origin=JFK&destination=LAX&tripType=round-trip&departureDate=2024-12-20&returnDate=2024-12-27&includeNearbyAirports=true&nearbyAirportsRadius=100
```

### Scenario 4: Multi-City Trip
```
User wants to visit multiple cities: New York → Los Angeles → San Francisco → New York.
```
**Request:**
```
POST /flights/search/multi-city
{
  "segments": [
    {"origin": "JFK", "destination": "LAX", "departureDate": "2024-12-20"},
    {"origin": "LAX", "destination": "SFO", "departureDate": "2024-12-25"},
    {"origin": "SFO", "destination": "JFK", "departureDate": "2024-12-30"}
  ],
  "passengers": 1
}
```

### Scenario 5: Check Availability Before Booking
```
User wants to check if 3 Business class seats are available on a specific flight.
```
**Request:**
```
POST /flights/availability/check
{
  "flightId": "flight-uuid",
  "passengers": 3,
  "fareClass": "Business"
}
```

---

## Summary

The Search & Availability implementation provides:

✅ **Comprehensive Search Capabilities**
- One-way, round-trip, and multi-city searches
- Flexible date ranges
- Nearby airport support

✅ **Advanced Filtering**
- Price, time, duration, aircraft, and fare class filters
- Multiple sorting options
- Pagination support

✅ **Real-Time Availability**
- Seat availability checks
- Overbooking policy enforcement
- Waitlist management foundation

✅ **Performance Optimized**
- Efficient database queries
- Proper indexing
- Pagination for large result sets

This implementation forms the foundation for a robust flight search and booking system, with room for future enhancements as the system scales.

