# Booking Flow Implementation Guide

## Overview

This document provides a comprehensive guide to the **Booking Flow** (Section 4) from the airline booking concepts. It covers the complete end-to-end booking process from flight search to ticket confirmation, including API usage, business logic, status management, and best practices.

## Table of Contents

1. [Booking Process Overview](#booking-process-overview)
2. [Step-by-Step Booking Flow](#step-by-step-booking-flow)
3. [API Reference](#api-reference)
4. [Status Management](#status-management)
5. [PNR & Ticket Generation](#pnr--ticket-generation)
6. [Seat Assignment](#seat-assignment)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)
9. [Integration Points](#integration-points)
10. [Best Practices](#best-practices)
11. [Complete Examples](#complete-examples)

## Booking Process Overview

The booking flow follows these sequential steps:

1. **Search**: Find flights using search availability API
2. **Select**: Choose flight and fare class
3. **Passenger Details**: Enter traveler information
4. **Seat Selection**: Choose seats (optional, can be done after booking)
5. **Add-ons**: Baggage, meals, insurance (future enhancement)
6. **Payment**: Process transaction (payment integration pending)
7. **Confirmation**: Generate PNR and tickets

### Flow Diagram

```
┌─────────┐
│  Search │  Find available flights
│ Flights │
└────┬────┘
     │
     ▼
┌─────────┐
│ Select  │  Choose flight and fare
│ Flight  │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Enter        │  Passenger information
│ Passenger    │
│ Details      │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Create       │  POST /bookings
│ Booking      │  Status: PENDING
│ (PNR Generated)│
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Assign Seats │  POST /bookings/:id/seats
│ (Optional)   │
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Process      │  Payment gateway
│ Payment      │  (Future)
└────┬─────────┘
     │
     ▼
┌──────────────┐
│ Confirm      │  PATCH /bookings/:id/status
│ Booking      │  Status: CONFIRMED
│ (Tickets Generated)│
└──────────────┘
```

## Step-by-Step Booking Flow

### Step 1: Search for Flights

**Endpoint**: `GET /flights/search`

Search for available flights based on origin, destination, dates, and passenger count.

**Example Request**:
```bash
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2
```

**Example Response**:
```json
{
  "flights": [
    {
      "id": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
      "flightNumber": "AA101",
      "departureTime": "2024-12-25T08:00:00Z",
      "arrivalTime": "2024-12-25T11:30:00Z",
      "availableSeats": 45,
      "baseFare": 250.00,
      "route": {
        "origin": { "code": "JFK", "name": "John F. Kennedy International Airport" },
        "destination": { "code": "LAX", "name": "Los Angeles International Airport" }
      }
    }
  ]
}
```

### Step 2: Create Booking

**Endpoint**: `POST /bookings`

Create a new booking with passenger details. This generates a PNR and reserves seats.

**Request Body**:
```json
{
  "userId": "user-uuid-optional",
  "flightId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "gender": "Male",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "nationality": "US",
      "passportNumber": "A12345678",
      "passportExpiryDate": "2030-01-15",
      "passportIssuingCountry": "US",
      "specialAssistance": "Wheelchair assistance required",
      "frequentFlyerNumber": "AA123456"
    },
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "dateOfBirth": "1992-05-20",
      "gender": "Female",
      "email": "jane.doe@example.com",
      "phoneNumber": "+1234567890",
      "nationality": "US",
      "passportNumber": "B87654321"
    }
  ],
  "totalAmount": 500.00,
  "currency": "USD",
  "notes": "Vegetarian meals requested for both passengers"
}
```

**Response**:
```json
{
  "id": "booking-uuid",
  "pnr": "ABC123",
  "status": "pending",
  "flightId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "totalAmount": 500.00,
  "currency": "USD",
  "bookingDate": "2024-12-01T10:30:00Z",
  "flight": {
    "id": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
    "flightNumber": "AA101",
    "departureTime": "2024-12-25T08:00:00Z",
    "arrivalTime": "2024-12-25T11:30:00Z",
    "route": {
      "origin": { "code": "JFK", "name": "John F. Kennedy International Airport" },
      "destination": { "code": "LAX", "name": "Los Angeles International Airport" }
    }
  },
  "passengers": [
    {
      "id": "passenger-1-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "email": "john.doe@example.com"
    },
    {
      "id": "passenger-2-uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "dateOfBirth": "1992-05-20",
      "email": "jane.doe@example.com"
    }
  ],
  "tickets": [],
  "seatAssignments": []
}
```

**Business Logic**:
1. Validates flight exists and has sufficient available seats
2. Generates unique PNR (6-character alphanumeric code)
3. Validates user if `userId` is provided
4. Creates booking record with status `PENDING`
5. Creates passenger records linked to booking
6. Updates flight inventory (decrements `availableSeats`, increments `bookedSeats`)
7. Returns booking with all relations loaded

### Step 3: Assign Seats (Optional)

**Endpoint**: `POST /bookings/:id/seats`

Assign seats to passengers. This can be done at any time after booking creation.

**Request Body**:
```json
{
  "passengerId": "passenger-1-uuid",
  "seatNumber": "12A",
  "seatType": "window",
  "seatClass": "economy"
}
```

**Response**:
```json
{
  "id": "seat-assignment-uuid",
  "bookingId": "booking-uuid",
  "passengerId": "passenger-1-uuid",
  "seatNumber": "12A",
  "seatType": "window",
  "seatClass": "economy",
  "assignedDate": "2024-12-01T10:35:00Z"
}
```

**Business Rules**:
- Passenger must belong to the booking
- Seat number must be unique within the booking
- Each passenger can have only one seat assignment
- Seat can be assigned at any time after booking creation

### Step 4: Confirm Booking

**Endpoint**: `PATCH /bookings/:id/status`

Confirm the booking after payment processing. This automatically generates tickets.

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Response**:
```json
{
  "id": "booking-uuid",
  "pnr": "ABC123",
  "status": "confirmed",
  "confirmationDate": "2024-12-01T10:40:00Z",
  "tickets": [
    {
      "id": "ticket-1-uuid",
      "ticketNumber": "0011234567890",
      "passengerId": "passenger-1-uuid",
      "fare": 250.00,
      "taxes": 25.00,
      "fees": 12.50,
      "fareClass": "Economy",
      "issuedDate": "2024-12-01T10:40:00Z",
      "expiryDate": "2025-12-01T10:40:00Z",
      "isActive": true
    },
    {
      "id": "ticket-2-uuid",
      "ticketNumber": "0011234567891",
      "passengerId": "passenger-2-uuid",
      "fare": 250.00,
      "taxes": 25.00,
      "fees": 12.50,
      "fareClass": "Economy",
      "issuedDate": "2024-12-01T10:40:00Z",
      "expiryDate": "2025-12-01T10:40:00Z",
      "isActive": true
    }
  ]
}
```

**Automatic Actions**:
- Sets `confirmationDate` timestamp
- Generates tickets for all passengers (if not already generated)
- Each ticket gets a unique 13-digit IATA ticket number

## API Reference

### Booking Creation

**Endpoint**: `POST /bookings`

**Request Body** (`CreateBookingDto`):
```typescript
{
  userId?: string;              // Optional - for registered users
  flightId: string;             // Required - UUID of selected flight
  passengers: [                 // Required - Array of passenger details
    {
      firstName: string;        // Required
      lastName: string;         // Required
      dateOfBirth: string;      // Required - ISO date format (YYYY-MM-DD)
      gender?: string;
      email?: string;
      phoneNumber?: string;
      nationality?: string;
      passportNumber?: string;
      passportExpiryDate?: string;
      passportIssuingCountry?: string;
      specialAssistance?: string;
      frequentFlyerNumber?: string;
    }
  ],
  totalAmount: number;          // Required - Total booking amount
  currency?: string;            // Optional - Default: 'USD'
  notes?: string;               // Optional - Special requests/notes
}
```

**Response**: Complete booking object with all relations

**Status Codes**:
- `201 Created`: Booking created successfully
- `400 Bad Request`: Insufficient seats or validation error
- `404 Not Found`: Flight or user not found
- `409 Conflict`: Failed to generate unique PNR

### Retrieve Booking

**Get by ID**: `GET /bookings/:id`

**Get by PNR**: `GET /bookings/pnr/:pnr` (case-insensitive)

**Search Bookings**: `GET /bookings/search?pnr=ABC123&status=confirmed&page=1&limit=10`

**Query Parameters**:
- `pnr`: Filter by PNR code
- `userId`: Filter by user ID
- `flightId`: Filter by flight ID
- `status`: Filter by booking status
- `bookingDateFrom`: Start date filter (YYYY-MM-DD)
- `bookingDateTo`: End date filter (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Update Booking Status

**Endpoint**: `PATCH /bookings/:id/status`

**Request Body**:
```json
{
  "status": "confirmed" | "cancelled" | "checked-in",
  "cancellationReason": "string"  // Required when status is 'cancelled'
}
```

**Status Transitions**:
- `PENDING` → `CONFIRMED`: Triggers ticket generation
- `PENDING` → `CANCELLED`: Releases seats back to inventory
- `CONFIRMED` → `CHECKED_IN`: Marks booking as checked in
- `CONFIRMED` → `CANCELLED`: Releases seats back to inventory

### Seat Assignment

**Assign Seat**: `POST /bookings/:id/seats`

**Request Body**:
```json
{
  "passengerId": "uuid",
  "seatNumber": "12A",
  "seatType": "window",
  "seatClass": "economy"
}
```

**Get Seat Assignments**: `GET /bookings/:id/seats`

**Remove Seat Assignment**: `DELETE /bookings/:id/seats/:seatAssignmentId`

### Ticket Generation

**Manual Generation**: `POST /bookings/:id/tickets`

**Note**: Tickets are automatically generated when booking status changes to `CONFIRMED`. Manual generation is only needed if tickets were not generated automatically.

## Status Management

### Status Flow Diagram

```
┌─────────┐
│ PENDING │  Initial state after booking creation
└────┬────┘
     │
     ├─────────────────┐
     │                 │
     ▼                 ▼
┌──────────┐      ┌──────────┐
│CONFIRMED │      │CANCELLED │
└────┬─────┘      └──────────┘
     │
     ├──────────────┐
     │              │
     ▼              ▼
┌──────────┐  ┌──────────┐
│CHECKED_IN│  │CANCELLED │
└──────────┘  └──────────┘
```

### Status Descriptions

**PENDING**:
- Initial state when booking is created
- Seats are reserved but not confirmed
- Payment processing should occur in this state
- Can be cancelled or confirmed

**CONFIRMED**:
- Booking is confirmed after payment
- Tickets are automatically generated
- `confirmationDate` is set
- Seats remain reserved
- Can transition to `CHECKED_IN` or `CANCELLED`

**CANCELLED**:
- Booking is cancelled
- `cancellationDate` and `cancellationReason` are set
- Seats are released back to flight inventory
- Final state (cannot transition from cancelled)

**CHECKED_IN**:
- Passenger has checked in for the flight
- Typically set 24-48 hours before departure
- Can only be set from `CONFIRMED` status

### Automatic Actions by Status

**On CONFIRMED**:
- Sets `confirmationDate` timestamp
- Generates tickets for all passengers (if not already generated)
- Each ticket gets unique 13-digit IATA ticket number

**On CANCELLED**:
- Sets `cancellationDate` timestamp
- Stores `cancellationReason`
- Releases seats back to flight inventory:
  - Increments `flight.availableSeats` by passenger count
  - Decrements `flight.bookedSeats` by passenger count

## PNR & Ticket Generation

### PNR (Passenger Name Record)

**Format**: 6 alphanumeric characters (e.g., `ABC123`, `XY9Z2K`)

**Generation Process**:
1. Random generation from character set: `A-Z` and `0-9`
2. Uniqueness check against existing bookings
3. Retry mechanism (up to 10 attempts)
4. Stored in database with unique constraint

**Retrieval**: `GET /bookings/pnr/:pnr`
- Case-insensitive search
- Returns complete booking with all relations

**Use Cases**:
- Customer reference for booking lookup
- Check-in at airport
- Booking modifications
- Customer service inquiries

### Ticket Generation

**Format**: 13-digit IATA ticket number
- Format: `[Airline Code (3 digits)][Random 10 digits]`
- Example: `0011234567890`

**Automatic Generation**:
- Triggered when booking status changes to `CONFIRMED`
- One ticket per passenger
- Cannot regenerate if tickets already exist

**Ticket Details**:
- Unique ticket number (13 digits)
- Linked to booking and passenger
- Fare breakdown:
  - Base fare per passenger = `totalAmount / passengerCount`
  - Taxes = 10% of base fare (example)
  - Fees = 5% of base fare (example)
- Fare class (default: Economy)
- Issue date and expiry date (1 year from issue)
- Active status flag

**Manual Generation**: `POST /bookings/:id/tickets`

## Seat Assignment

### Assigning Seats

**Endpoint**: `POST /bookings/:id/seats`

**Request**:
```json
{
  "passengerId": "passenger-uuid",
  "seatNumber": "12A",
  "seatType": "window",
  "seatClass": "economy"
}
```

**Business Rules**:
- Passenger must belong to the booking
- Seat number must be unique within the booking
- Each passenger can have only one seat assignment
- Seat can be assigned at any time after booking creation

**Retrieving Seat Assignments**: `GET /bookings/:id/seats`
- Returns all seat assignments for the booking
- Ordered by seat number

**Removing Seat Assignment**: `DELETE /bookings/:id/seats/:seatAssignmentId`
- Allows changing seat assignments

### Future Enhancements
- Seat map visualization
- Seat type validation (window, aisle, exit row)
- Premium seat pricing
- Family/group seating preferences

## Data Models

### Booking Entity

**Core Fields**:
- `id`: UUID primary key
- `pnr`: Unique 6-character Passenger Name Record
- `flightId`: Reference to flight
- `userId`: Optional reference to user (allows guest bookings)
- `status`: Booking status enum (`pending`, `confirmed`, `cancelled`, `checked-in`)
- `totalAmount`: Total booking amount (decimal)
- `currency`: Currency code (default: USD)
- `notes`: Optional booking notes

**Timestamps**:
- `bookingDate`: When booking was created
- `confirmationDate`: When booking was confirmed
- `cancellationDate`: When booking was cancelled
- `cancellationReason`: Reason for cancellation
- `createdAt`: System creation timestamp
- `updatedAt`: System update timestamp

**Relations**:
- `flight`: Flight details (eager loaded)
- `user`: User details (if registered user)
- `passengers`: Array of passenger records
- `tickets`: Array of ticket records
- `seatAssignments`: Array of seat assignments

**Indexes**:
- Unique index on `pnr`
- Composite index on `flightId` and `status`
- Composite index on `userId` and `bookingDate`

### Passenger Entity

**Required Fields**:
- `firstName`: Full first name (max 100 chars)
- `lastName`: Full last name (max 100 chars)
- `dateOfBirth`: Date of birth (ISO date format)

**Optional Fields**:
- `gender`: Male, Female, Other
- `email`: Contact email address
- `phoneNumber`: Contact phone number
- `nationality`: Country of nationality
- `passportNumber`: Passport/ID number
- `passportExpiryDate`: Passport expiration date
- `passportIssuingCountry`: Country that issued passport
- `specialAssistance`: Special needs or assistance requirements
- `frequentFlyerNumber`: Airline loyalty program number

**Validation**:
- Email format validation when provided
- Date format validation (ISO 8601)
- String length constraints
- All passenger data linked to booking via `bookingId`

### Ticket Entity

**Fields**:
- `ticketNumber`: Unique 13-digit IATA ticket number
- `bookingId`: Reference to booking
- `passengerId`: Reference to passenger
- `fare`: Base fare amount
- `taxes`: Tax amount
- `fees`: Fee amount
- `fareClass`: Fare class (Economy, Business, First)
- `issuedDate`: When ticket was issued
- `expiryDate`: Ticket expiry date (1 year from issue)
- `isActive`: Active status flag

## Error Handling

### Common Error Scenarios

**Insufficient Seats**:
- **Error**: `400 Bad Request`
- **Message**: "Not enough available seats. Available: X, Required: Y"
- **Action**: Prevents booking creation

**PNR Generation Failure**:
- **Error**: `409 Conflict`
- **Message**: "Failed to generate unique PNR"
- **Occurrence**: After 10 failed uniqueness attempts (extremely rare)

**Duplicate Seat Assignment**:
- **Error**: `409 Conflict`
- **Message**: "Seat [seatNumber] is already assigned"
- **Action**: Prevents double-booking of seats

**Passenger Not in Booking**:
- **Error**: `404 Not Found`
- **Message**: "Passenger not found in this booking"
- **Action**: Validates seat assignment requests

**Ticket Regeneration Attempt**:
- **Error**: `400 Bad Request`
- **Message**: "Tickets already generated for this booking"
- **Action**: Prevents duplicate ticket generation

**Flight Not Found**:
- **Error**: `404 Not Found`
- **Message**: "Flight not found"
- **Action**: Validates flight existence before booking

**User Not Found**:
- **Error**: `404 Not Found`
- **Message**: "User not found"
- **Action**: Validates user existence when userId is provided

## Integration Points

### Current Integrations

**Flight Service**:
- Validates flight existence
- Checks seat availability
- Updates flight inventory on booking creation/cancellation

**User Service**:
- Validates user existence (if provided)
- Links booking to user account
- Enables user-specific booking queries

### Future Integrations

**Payment Gateway**:
- Process payment before confirmation
- Handle payment failures
- Refund processing on cancellation

**Email Service**:
- Send booking confirmations
- Send ticket details
- Send check-in reminders
- Send flight status updates

**SMS Service**:
- Send booking confirmations
- Send PNR via SMS
- Send check-in reminders

**Notification Service**:
- Real-time booking updates
- Push notifications for mobile apps
- WebSocket updates for web apps

## Best Practices

### Booking Creation

1. **Always validate flight availability** before creating booking
2. **Generate PNR immediately** upon booking creation
3. **Set initial status to PENDING** until payment confirmation
4. **Create passenger records atomically** with booking
5. **Use database transactions** for booking creation to ensure data consistency

### Status Management

1. **Only confirm booking after successful payment**
2. **Always release seats on cancellation**
3. **Generate tickets only when booking is confirmed**
4. **Track all status change timestamps** for audit trail
5. **Validate status transitions** to prevent invalid state changes

### Data Integrity

1. **Use database transactions** for booking creation
2. **Maintain referential integrity** with foreign keys
3. **Validate passenger data** before saving
4. **Ensure PNR uniqueness** at database level with unique constraint
5. **Validate seat assignments** to prevent conflicts

### Performance

1. **Use eager loading** for frequently accessed relations
2. **Index frequently queried fields** (PNR, userId, status)
3. **Paginate large result sets** in search queries
4. **Cache flight availability** when possible
5. **Optimize database queries** to reduce N+1 problems

### Security

1. **Validate all input data** to prevent injection attacks
2. **Use UUIDs** for IDs to prevent enumeration attacks
3. **Implement rate limiting** on booking creation endpoints
4. **Log all booking operations** for audit purposes
5. **Protect sensitive passenger data** (PII compliance)

## Complete Examples

### Example 1: Complete Booking Flow

```bash
# Step 1: Search for flights
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2

# Step 2: Create booking
POST /bookings
{
  "flightId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "passengers": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-15",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "passportNumber": "A12345678"
    }
  ],
  "totalAmount": 250.00,
  "currency": "USD"
}

# Response includes PNR: "ABC123"

# Step 3: Assign seat
POST /bookings/{booking-id}/seats
{
  "passengerId": "passenger-uuid",
  "seatNumber": "12A"
}

# Step 4: Confirm booking (after payment)
PATCH /bookings/{booking-id}/status
{
  "status": "confirmed"
}

# Step 5: Retrieve booking by PNR
GET /bookings/pnr/ABC123
```

### Example 2: Guest Booking

```bash
# Create booking without userId (guest booking)
POST /bookings
{
  "flightId": "flight-uuid",
  "passengers": [
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "dateOfBirth": "1985-03-20",
      "email": "jane.smith@example.com"
    }
  ],
  "totalAmount": 300.00
}

# Booking created with PNR, can be retrieved later using PNR
GET /bookings/pnr/XYZ789
```

### Example 3: Booking Cancellation

```bash
# Cancel a booking
PATCH /bookings/{booking-id}/status
{
  "status": "cancelled",
  "cancellationReason": "Change of plans"
}

# Seats are automatically released back to flight inventory
# Booking status becomes "cancelled" (final state)
```

### Example 4: Search Bookings

```bash
# Search bookings by status
GET /bookings/search?status=confirmed&page=1&limit=10

# Search bookings by user
GET /bookings/user/{user-id}

# Search bookings by date range
GET /bookings/search?bookingDateFrom=2024-12-01&bookingDateTo=2024-12-31
```

### Example 5: Multiple Passengers with Seats

```bash
# Create booking with 3 passengers
POST /bookings
{
  "flightId": "flight-uuid",
  "passengers": [
    { "firstName": "John", "lastName": "Doe", "dateOfBirth": "1990-01-15" },
    { "firstName": "Jane", "lastName": "Doe", "dateOfBirth": "1992-05-20" },
    { "firstName": "Bob", "lastName": "Doe", "dateOfBirth": "2015-08-10" }
  ],
  "totalAmount": 750.00
}

# Assign seats for family (together)
POST /bookings/{booking-id}/seats
{ "passengerId": "passenger-1-uuid", "seatNumber": "12A" }

POST /bookings/{booking-id}/seats
{ "passengerId": "passenger-2-uuid", "seatNumber": "12B" }

POST /bookings/{booking-id}/seats
{ "passengerId": "passenger-3-uuid", "seatNumber": "12C" }

# Get all seat assignments
GET /bookings/{booking-id}/seats
```

## Related Documentation

- [Booking Management Implementation](03-booking-management-implementation.md) - Detailed entity and module structure
- [Flight Search & Availability](06-search-availability-implementation.md) - Flight search before booking
- [Airline Booking Concepts](00-airline-booking-concepts.md) - Complete domain concepts

## Summary

The booking flow is a critical component of the airline booking system, managing the complete lifecycle from initial reservation to ticket confirmation. Key features include:

- **PNR Generation**: Unique 6-character booking reference
- **Status Management**: PENDING → CONFIRMED → CHECKED_IN workflow
- **Ticket Generation**: Automatic IATA-compliant ticket creation
- **Seat Assignment**: Flexible seat selection for passengers
- **Inventory Management**: Real-time seat availability updates
- **Guest Bookings**: Support for both registered and guest users

The implementation follows best practices for data integrity, error handling, and performance optimization, ensuring a reliable and scalable booking system.

