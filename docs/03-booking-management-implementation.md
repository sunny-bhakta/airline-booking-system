# Booking Management Implementation Guide

## Overview

This document explains how **1.3 Booking & Reservation** from the airline booking concepts has been implemented in the NestJS application.

## Architecture

The Booking Management module is implemented as a feature module in NestJS following Domain-Driven Design principles.

### Module Structure

```
src/bookings/
├── entities/           # Database entities
│   ├── passenger.entity.ts
│   ├── booking.entity.ts
│   ├── ticket.entity.ts
│   ├── seat-assignment.entity.ts
│   └── index.ts
├── dto/                # Data Transfer Objects
│   ├── create-passenger.dto.ts
│   ├── create-booking.dto.ts
│   ├── update-booking.dto.ts
│   ├── create-seat-assignment.dto.ts
│   ├── search-bookings.dto.ts
│   └── index.ts
├── bookings.controller.ts
├── bookings.service.ts
└── bookings.module.ts
```

## Core Concepts Implementation

### 1. Booking Entity

The main entity representing a reservation of flight seats.

**Key Features:**
- Unique PNR (Passenger Name Record) - 6 alphanumeric characters
- Booking status workflow (Pending → Confirmed → Checked-in/Cancelled)
- Links to Flight and multiple Passengers
- Tracks booking dates, confirmation, and cancellation
- Manages total amount and currency

**Fields:**
- `pnr`: Unique 6-character booking reference (e.g., "ABC123")
- `flightId`: Reference to Flight entity
- `status`: Booking status enum (pending, confirmed, cancelled, checked-in)
- `totalAmount`: Total booking amount
- `currency`: Currency code (default: USD)
- `bookingDate`: When booking was created
- `confirmationDate`: When booking was confirmed
- `cancellationDate`: When booking was cancelled
- `cancellationReason`: Reason for cancellation

**Relationships:**
- Many-to-One with Flight
- One-to-Many with Passenger
- One-to-Many with Ticket
- One-to-Many with SeatAssignment

### 2. Passenger Entity

Represents a person traveling with personal and travel information.

**Key Features:**
- Personal information (name, date of birth, gender)
- Contact details (email, phone)
- Passport/ID information
- Special assistance needs
- Frequent flyer number

**Fields:**
- `firstName` / `lastName`: Full name
- `dateOfBirth`: Date of birth
- `gender`: Gender (male, female, other)
- `email`: Email address
- `phoneNumber`: Contact number
- `nationality`: Country of nationality
- `passportNumber`: Passport/ID number
- `passportExpiryDate`: Passport expiration
- `passportIssuingCountry`: Country that issued passport
- `specialAssistance`: Special needs or assistance requirements
- `frequentFlyerNumber`: Loyalty program number

**Relationships:**
- Many-to-One with Booking

### 3. Ticket Entity

Confirmed travel document with IATA-compliant ticket number.

**Key Features:**
- 13-digit IATA ticket number format
- Fare breakdown (fare, taxes, fees)
- Fare class designation
- Issue and expiry dates
- Active/inactive status

**Fields:**
- `ticketNumber`: Unique 13-digit IATA ticket number
- `bookingId`: Reference to Booking
- `passengerId`: Reference to Passenger
- `fare`: Base fare amount
- `taxes`: Tax amount
- `fees`: Service fees
- `fareClass`: Class of service (Economy, Business, First, etc.)
- `issuedDate`: When ticket was issued
- `expiryDate`: Ticket expiration date
- `isActive`: Whether ticket is currently active

**Relationships:**
- Many-to-One with Booking
- Many-to-One with Passenger

### 4. SeatAssignment Entity

Specific seat selection for a passenger in a booking.

**Key Features:**
- Seat number assignment (e.g., "12A", "1B")
- Seat type classification (window, aisle, middle, exit-row)
- Seat class designation
- Premium seat pricing
- Preferred seat flag

**Fields:**
- `bookingId`: Reference to Booking
- `passengerId`: Reference to Passenger
- `seatNumber`: Seat identifier (e.g., "12A")
- `seatType`: Type of seat (window, aisle, middle, exit-row)
- `seatClass`: Class of seat (economy, premium-economy, business, first)
- `seatPrice`: Additional cost for premium seats
- `isPreferred`: User's preferred seat selection
- `assignedDate`: When seat was assigned

**Relationships:**
- Many-to-One with Booking
- Many-to-One with Passenger

## Booking Status Workflow

```
PENDING → CONFIRMED → CHECKED_IN
    ↓
CANCELLED
```

### Status Transitions

1. **PENDING** (Default)
   - Initial state when booking is created
   - Seats are reserved but not confirmed
   - No tickets generated yet

2. **CONFIRMED**
   - Booking is confirmed and paid
   - Tickets are automatically generated
   - Seats are confirmed
   - Confirmation date is set

3. **CHECKED_IN**
   - Passenger has checked in for the flight
   - Can be set during check-in process

4. **CANCELLED**
   - Booking is cancelled
   - Seats are released back to flight inventory
   - Cancellation date and reason are recorded
   - Tickets are marked inactive

## API Endpoints

### Booking Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bookings` | Create a new booking |
| `GET` | `/bookings` | Get all bookings |
| `GET` | `/bookings/:id` | Get booking by ID |
| `GET` | `/bookings/pnr/:pnr` | Get booking by PNR |
| `GET` | `/bookings/search` | Search bookings with filters |
| `GET` | `/bookings/status/:status` | Get bookings by status |
| `PATCH` | `/bookings/:id` | Update booking |
| `PATCH` | `/bookings/:id/status` | Update booking status |
| `DELETE` | `/bookings/:id` | Delete booking |

### Ticket Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bookings/:id/tickets` | Generate tickets for a booking |

### Seat Assignment Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bookings/:id/seats` | Assign seat to a passenger |
| `GET` | `/bookings/:id/seats` | Get seat assignments for a booking |
| `DELETE` | `/bookings/:id/seats/:seatAssignmentId` | Remove seat assignment |

### Example Requests

#### Create Booking

```json
POST /bookings
{
  "flightId": "flight-uuid-here",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "nationality": "USA",
      "passportNumber": "A12345678",
      "passportExpiryDate": "2030-01-15",
      "passportIssuingCountry": "USA"
    }
  ],
  "totalAmount": 500.00,
  "currency": "USD",
  "notes": "Window seat preferred"
}
```

#### Search Bookings

```
GET /bookings/search?pnr=ABC123
GET /bookings/search?status=confirmed&page=1&limit=10
GET /bookings/search?flightId=flight-uuid&bookingDateFrom=2024-01-01&bookingDateTo=2024-12-31
```

#### Update Booking Status

```json
PATCH /bookings/:id/status
{
  "status": "confirmed"
}
```

#### Assign Seat

```json
POST /bookings/:id/seats
{
  "passengerId": "passenger-uuid",
  "seatNumber": "12A",
  "seatType": "window",
  "seatClass": "economy",
  "seatPrice": 0,
  "isPreferred": true
}
```

#### Generate Tickets

```
POST /bookings/:id/tickets
```

This automatically generates tickets for all passengers when booking is confirmed.

## Business Logic

### Booking Creation

1. **Validation:**
   - Validates flight exists
   - Checks seat availability
   - Ensures enough seats for all passengers

2. **PNR Generation:**
   - Generates unique 6-character alphanumeric PNR
   - Retries if PNR collision occurs (up to 10 attempts)
   - Ensures uniqueness in database

3. **Passenger Creation:**
   - Creates passenger records for each traveler
   - Links passengers to booking
   - Stores all required passenger information

4. **Inventory Update:**
   - Decrements available seats on flight
   - Increments booked seats on flight
   - Prevents overbooking

5. **Initial Status:**
   - Sets booking status to PENDING
   - Records booking date

### Booking Confirmation

1. **Status Update:**
   - Changes status from PENDING to CONFIRMED
   - Records confirmation date

2. **Ticket Generation:**
   - Automatically generates tickets for all passengers
   - Creates unique 13-digit IATA ticket numbers
   - Calculates fare breakdown (base fare, taxes, fees)
   - Sets ticket expiry date (1 year from issue)

3. **Ticket Number Format:**
   - 13 digits: 3-digit airline code + 10-digit unique number
   - Example: "0011234567890"

### Booking Cancellation

1. **Status Update:**
   - Changes status to CANCELLED
   - Records cancellation date and reason

2. **Inventory Release:**
   - Releases seats back to flight
   - Decrements booked seats
   - Increments available seats

3. **Ticket Deactivation:**
   - Marks tickets as inactive (if generated)

### Seat Assignment

1. **Validation:**
   - Verifies passenger belongs to booking
   - Checks seat is not already assigned
   - Ensures passenger doesn't already have a seat

2. **Assignment:**
   - Creates seat assignment record
   - Links to booking and passenger
   - Records assignment date

3. **Conflict Prevention:**
   - Prevents duplicate seat assignments
   - Prevents multiple seats per passenger

### PNR Lookup

- Case-insensitive PNR search
- Returns full booking details with all relations
- Used for customer self-service

## Database Schema

The implementation uses TypeORM with SQLite (can be easily switched to PostgreSQL/MySQL).

**Relationships:**
- Booking → Flight (Many-to-One)
- Booking → Passenger (One-to-Many)
- Booking → Ticket (One-to-Many)
- Booking → SeatAssignment (One-to-Many)
- Ticket → Passenger (Many-to-One)
- SeatAssignment → Passenger (Many-to-One)

**Indexes:**
- `bookings.pnr` - Unique index for fast PNR lookup
- `bookings.flightId, bookings.status` - Composite index for filtering
- `tickets.ticketNumber` - Unique index for ticket lookup
- `seat_assignments.bookingId, seat_assignments.seatNumber` - Unique composite index

## Usage Example

### Complete Booking Flow

1. **Search for Flights:**
```bash
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2
```

2. **Create Booking:**
```json
POST /bookings
{
  "flightId": "flight-uuid-from-search",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "passportNumber": "A12345678"
    },
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "dateOfBirth": "1992-05-20",
      "email": "jane@example.com",
      "phoneNumber": "+1234567890",
      "passportNumber": "B87654321"
    }
  ],
  "totalAmount": 1000.00,
  "currency": "USD"
}
```

Response includes:
- Booking ID
- PNR (e.g., "ABC123")
- Status: "pending"
- All passenger details

3. **Confirm Booking (Payment Processing):**
```json
PATCH /bookings/:id/status
{
  "status": "confirmed"
}
```

This automatically:
- Generates tickets for all passengers
- Sets confirmation date
- Updates status to "confirmed"

4. **Assign Seats:**
```json
POST /bookings/:id/seats
{
  "passengerId": "passenger-1-uuid",
  "seatNumber": "12A",
  "seatType": "window",
  "seatClass": "economy"
}

POST /bookings/:id/seats
{
  "passengerId": "passenger-2-uuid",
  "seatNumber": "12B",
  "seatType": "aisle",
  "seatClass": "economy"
}
```

5. **Retrieve Booking by PNR:**
```bash
GET /bookings/pnr/ABC123
```

Returns complete booking with:
- Flight details
- All passengers
- All tickets
- All seat assignments

6. **Check-in (Optional):**
```json
PATCH /bookings/:id/status
{
  "status": "checked-in"
}
```

7. **Cancel Booking (if needed):**
```json
PATCH /bookings/:id/status
{
  "status": "cancelled",
  "cancellationReason": "Change of plans"
}
```

This automatically releases seats back to the flight.

## Error Handling

The service includes comprehensive error handling:

- **NotFoundException:**
  - Flight not found
  - Booking not found
  - Passenger not found in booking
  - Seat assignment not found

- **BadRequestException:**
  - Not enough available seats
  - Cannot delete confirmed booking
  - Tickets already generated
  - Passenger already has seat assigned

- **ConflictException:**
  - Failed to generate unique PNR (after 10 attempts)
  - Failed to generate unique ticket number
  - Seat already assigned

## Validation

All DTOs include validation using `class-validator`:

- **CreateBookingDto:**
  - Flight ID (UUID format)
  - At least one passenger required
  - Total amount must be positive

- **CreatePassengerDto:**
  - Required: firstName, lastName, dateOfBirth
  - Optional: email (validated), phone, passport info
  - Date format validation

- **CreateSeatAssignmentDto:**
  - Passenger ID (UUID)
  - Seat number (1-10 characters)
  - Optional seat type, class, price

- **SearchBookingsDto:**
  - Optional filters with proper type validation
  - Pagination with min values

## Integration with Flight Module

The booking module integrates seamlessly with the flight module:

1. **Seat Inventory Management:**
   - Automatically updates `flight.availableSeats` and `flight.bookedSeats`
   - Prevents overbooking
   - Releases seats on cancellation

2. **Flight Validation:**
   - Validates flight exists before creating booking
   - Checks seat availability
   - Links booking to flight for reporting

## Next Steps

To enhance the Booking Management system, consider adding:

1. **Payment Integration:**
   - Payment gateway integration
   - Payment status tracking
   - Refund processing

2. **Booking Modifications:**
   - Date/time change
   - Passenger name change
   - Route change

3. **Notifications:**
   - Booking confirmation emails
   - Ticket delivery
   - Check-in reminders
   - Flight status updates

4. **Ancillary Services:**
   - Baggage booking
   - Meal selection
   - Travel insurance
   - Lounge access

5. **Loyalty Integration:**
   - Frequent flyer points earning
   - Points redemption
   - Tier benefits

6. **Reporting:**
   - Booking statistics
   - Revenue reports
   - Passenger analytics
   - Seat utilization

7. **Check-in Module:**
   - Online check-in
   - Boarding pass generation
   - Baggage check-in

## Testing

Run the application:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/bookings`

Test the booking flow:
1. Create a booking
2. Confirm the booking (generates tickets)
3. Assign seats
4. Retrieve by PNR
5. Cancel if needed

## Security Considerations

- PNR should be treated as sensitive information
- Consider rate limiting on PNR lookup endpoints
- Implement authentication/authorization for booking operations
- Encrypt sensitive passenger data (passport numbers, etc.)
- Implement audit logging for booking changes
- Add data retention policies for cancelled bookings

