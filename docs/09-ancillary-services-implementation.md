# Ancillary Services Implementation Guide

## Overview

This document provides a comprehensive guide to the **Ancillary Services** (Section 6) from the airline booking concepts. It covers baggage management, in-flight services, and travel insurance, including API usage, business logic, data models, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Baggage Management](#baggage-management)
3. [In-Flight Services](#in-flight-services)
4. [Travel Insurance](#travel-insurance)
5. [API Reference](#api-reference)
6. [Data Models](#data-models)
7. [Business Logic](#business-logic)
8. [Integration with Bookings](#integration-with-bookings)
9. [Complete Examples](#complete-examples)
10. [Best Practices](#best-practices)

## Overview

Ancillary services are additional products and services that can be added to a booking beyond the base flight ticket. These services generate additional revenue and enhance the passenger experience.

### Service Categories

1. **Baggage**: Cabin, checked, excess, and special baggage
2. **In-Flight Services**: Meals, entertainment, Wi-Fi, priority boarding, lounge access
3. **Travel Insurance**: Trip cancellation, medical, baggage, flight delay insurance

### Key Features

- **Flexible Assignment**: Services can be assigned at booking-level or passenger-specific
- **Pricing**: Each service has its own pricing and currency
- **Quantity Management**: Support for multiple quantities (e.g., multiple baggage pieces, multiple meals)
- **Status Tracking**: Track service status and coverage periods
- **Integration**: Seamlessly integrated with booking system

## Baggage Management

### Baggage Types

- **CABIN**: Carry-on baggage (typically free)
- **CHECKED**: Checked baggage (may have free allowance or require payment)
- **EXCESS**: Excess baggage beyond free allowance
- **SPECIAL**: Special baggage requiring special handling

### Special Baggage Categories

- **SPORTS_EQUIPMENT**: Golf clubs, skis, bicycles, etc.
- **PETS**: Live animals
- **FRAGILE**: Fragile items requiring careful handling
- **MUSICAL_INSTRUMENT**: Musical instruments
- **WHEELCHAIR**: Wheelchairs and mobility aids
- **MEDICAL_EQUIPMENT**: Medical devices and equipment
- **OTHER**: Other special items

### Baggage Entity

**Fields:**
- `id`: UUID primary key
- `bookingId`: Reference to Booking
- `passengerId`: Optional - Reference to Passenger (for passenger-specific baggage)
- `type`: Baggage type (cabin, checked, excess, special)
- `specialCategory`: Special baggage category (for special baggage)
- `weight`: Weight in kg
- `length`, `width`, `height`: Dimensions in cm (optional)
- `quantity`: Number of pieces
- `price`: Price for this baggage item
- `currency`: Currency code (default: USD)
- `description`: Description of special baggage
- `notes`: Additional notes

**Relationships:**
- Many-to-One with Booking
- Many-to-One with Passenger (optional)

## In-Flight Services

### Service Types

- **MEAL**: Pre-ordered meals
- **ENTERTAINMENT**: In-flight entertainment access
- **WIFI**: Internet connectivity
- **PRIORITY_BOARDING**: Early boarding access
- **LOUNGE_ACCESS**: Airport lounge passes
- **EXTRA_LEGROOM**: Extra legroom seats
- **OTHER**: Other services

### Meal Types

- **STANDARD**: Standard meal
- **VEGETARIAN**: Vegetarian meal
- **VEGAN**: Vegan meal
- **HALAL**: Halal meal
- **KOSHER**: Kosher meal
- **GLUTEN_FREE**: Gluten-free meal
- **DIABETIC**: Diabetic meal
- **CHILD**: Child meal
- **INFANT**: Infant meal
- **OTHER**: Other dietary requirements

### In-Flight Service Entity

**Fields:**
- `id`: UUID primary key
- `bookingId`: Reference to Booking
- `passengerId`: Optional - Reference to Passenger (for passenger-specific service)
- `type`: Service type (meal, entertainment, wifi, etc.)
- `mealType`: Meal type (for meal services)
- `serviceName`: Name of the service (e.g., "Wi-Fi 24hrs")
- `description`: Service description
- `price`: Price for this service
- `currency`: Currency code (default: USD)
- `quantity`: Number of units (e.g., number of meals, hours of wifi)
- `specialRequirements`: Special dietary requirements, preferences, etc.
- `notes`: Additional notes

**Relationships:**
- Many-to-One with Booking
- Many-to-One with Passenger (optional)

## Travel Insurance

### Insurance Types

- **TRIP_CANCELLATION**: Trip cancellation insurance
- **MEDICAL**: Medical insurance
- **BAGGAGE**: Baggage insurance
- **FLIGHT_DELAY**: Flight delay insurance
- **COMPREHENSIVE**: Comprehensive coverage

### Insurance Status

- **ACTIVE**: Insurance is active and valid
- **EXPIRED**: Insurance coverage has expired
- **CANCELLED**: Insurance was cancelled
- **CLAIMED**: Insurance claim has been filed

### Travel Insurance Entity

**Fields:**
- `id`: UUID primary key
- `bookingId`: Reference to Booking
- `passengerId`: Optional - Reference to Passenger (for passenger-specific insurance)
- `type`: Insurance type
- `policyName`: Name of the insurance policy
- `description`: Policy description and coverage details
- `coverageAmount`: Maximum coverage amount
- `currency`: Currency code (default: USD)
- `premium`: Insurance premium price
- `status`: Insurance status (active, expired, cancelled, claimed)
- `startDate`: Coverage start date
- `endDate`: Coverage end date
- `policyNumber`: Insurance policy number
- `provider`: Insurance provider name
- `termsAndConditions`: Policy terms and conditions
- `notes`: Additional notes

**Relationships:**
- Many-to-One with Booking
- Many-to-One with Passenger (optional)

## API Reference

### Ancillary Services Endpoints

#### Baggage Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ancillary/baggage` | Add baggage to a booking |
| `GET` | `/ancillary/baggage/booking/:bookingId` | Get all baggage for a booking |
| `GET` | `/ancillary/baggage/:id` | Get baggage by ID |
| `PATCH` | `/ancillary/baggage/:id` | Update baggage |
| `DELETE` | `/ancillary/baggage/:id` | Remove baggage |

#### In-Flight Services Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ancillary/in-flight-services` | Add in-flight service to a booking |
| `GET` | `/ancillary/in-flight-services/booking/:bookingId` | Get all in-flight services for a booking |
| `GET` | `/ancillary/in-flight-services/:id` | Get in-flight service by ID |
| `PATCH` | `/ancillary/in-flight-services/:id` | Update in-flight service |
| `DELETE` | `/ancillary/in-flight-services/:id` | Remove in-flight service |

#### Travel Insurance Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ancillary/travel-insurance` | Add travel insurance to a booking |
| `GET` | `/ancillary/travel-insurance/booking/:bookingId` | Get all travel insurance for a booking |
| `GET` | `/ancillary/travel-insurance/:id` | Get travel insurance by ID |
| `PATCH` | `/ancillary/travel-insurance/:id` | Update travel insurance |
| `DELETE` | `/ancillary/travel-insurance/:id` | Remove travel insurance |

#### Aggregate Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ancillary/booking/:bookingId` | Get all ancillary services for a booking with totals |

### Booking Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/bookings/:id/ancillary` | Get all ancillary services for a booking |
| `GET` | `/bookings/:id/baggage` | Get baggage for a booking |
| `GET` | `/bookings/:id/in-flight-services` | Get in-flight services for a booking |
| `GET` | `/bookings/:id/travel-insurance` | Get travel insurance for a booking |

## Data Models

### Create Baggage DTO

```typescript
{
  bookingId: string;           // Required: Booking UUID
  passengerId?: string;          // Optional: Passenger UUID
  type: BaggageType;            // Required: cabin | checked | excess | special
  specialCategory?: string;      // Optional: For special baggage
  weight: number;               // Required: Weight in kg
  length?: number;               // Optional: Length in cm
  width?: number;               // Optional: Width in cm
  height?: number;              // Optional: Height in cm
  quantity?: number;            // Optional: Number of pieces (default: 1)
  price: number;                // Required: Price for this baggage item
  currency?: string;             // Optional: Currency code (default: USD)
  description?: string;         // Optional: Description of special baggage
  notes?: string;               // Optional: Additional notes
}
```

### Create In-Flight Service DTO

```typescript
{
  bookingId: string;            // Required: Booking UUID
  passengerId?: string;         // Optional: Passenger UUID
  type: InFlightServiceType;   // Required: meal | entertainment | wifi | etc.
  mealType?: MealType;         // Optional: For meal services
  serviceName?: string;         // Optional: Name of the service
  description?: string;         // Optional: Service description
  price: number;                // Required: Price for this service
  currency?: string;            // Optional: Currency code (default: USD)
  quantity?: number;           // Optional: Number of units (default: 1)
  specialRequirements?: string; // Optional: Special requirements
  notes?: string;               // Optional: Additional notes
}
```

### Create Travel Insurance DTO

```typescript
{
  bookingId: string;            // Required: Booking UUID
  passengerId?: string;         // Optional: Passenger UUID
  type: InsuranceType;         // Required: trip_cancellation | medical | etc.
  policyName?: string;          // Optional: Policy name
  description?: string;         // Optional: Policy description
  coverageAmount: number;       // Required: Maximum coverage amount
  currency?: string;            // Optional: Currency code (default: USD)
  premium: number;              // Required: Insurance premium price
  startDate: string;            // Required: Coverage start date (ISO 8601)
  endDate: string;              // Required: Coverage end date (ISO 8601)
  policyNumber?: string;        // Optional: Policy number
  provider?: string;            // Optional: Insurance provider
  termsAndConditions?: string; // Optional: Terms and conditions
  notes?: string;               // Optional: Additional notes
}
```

## Business Logic

### Baggage Management

1. **Validation:**
   - Booking must exist
   - If passengerId is provided, passenger must belong to the booking
   - Weight must be positive
   - Dimensions (if provided) must be positive

2. **Pricing:**
   - Each baggage item has its own price
   - Total baggage cost = sum of (price × quantity) for all baggage items

3. **Special Baggage:**
   - Special baggage requires specialCategory to be specified
   - Description should be provided for special baggage

### In-Flight Services

1. **Validation:**
   - Booking must exist
   - If passengerId is provided, passenger must belong to the booking
   - For meal services, mealType should be specified

2. **Pricing:**
   - Each service has its own price
   - Total service cost = sum of (price × quantity) for all services

3. **Quantity Management:**
   - Quantity represents number of units (e.g., meals, hours of wifi)
   - Default quantity is 1

### Travel Insurance

1. **Validation:**
   - Booking must exist
   - If passengerId is provided, passenger must belong to the booking
   - End date must be after start date
   - Coverage amount and premium must be positive

2. **Status Management:**
   - Insurance starts as ACTIVE
   - Status can be updated to EXPIRED, CANCELLED, or CLAIMED
   - Status should be automatically updated based on dates

3. **Coverage Period:**
   - Coverage period is defined by startDate and endDate
   - Dates are validated to ensure endDate > startDate

## Integration with Bookings

### Booking Entity Updates

The Booking entity now includes relationships to ancillary services:

```typescript
@OneToMany(() => Baggage, (baggage) => baggage.booking)
baggageItems: Baggage[];

@OneToMany(() => InFlightService, (service) => service.booking)
inFlightServices: InFlightService[];

@OneToMany(() => TravelInsurance, (insurance) => insurance.booking)
travelInsurance: TravelInsurance[];
```

### Ancillary Services Totals

When retrieving all ancillary services for a booking, the API returns:

```typescript
{
  baggage: Baggage[];
  inFlightServices: InFlightService[];
  travelInsurance: TravelInsurance[];
  totals: {
    baggage: number;           // Total baggage cost
    inFlightServices: number; // Total in-flight services cost
    travelInsurance: number;  // Total insurance premium
    total: number;            // Grand total
  }
}
```

## Complete Examples

### Example 1: Add Checked Baggage

```json
POST /ancillary/baggage
{
  "bookingId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "passengerId": "passenger-uuid-here",
  "type": "checked",
  "weight": 23.5,
  "length": 158,
  "width": 55,
  "height": 40,
  "quantity": 1,
  "price": 50.00,
  "currency": "USD"
}
```

**Response:**
```json
{
  "id": "baggage-uuid",
  "bookingId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "passengerId": "passenger-uuid-here",
  "type": "checked",
  "weight": 23.5,
  "length": 158,
  "width": 55,
  "height": 40,
  "quantity": 1,
  "price": 50.00,
  "currency": "USD",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Example 2: Add Special Baggage (Sports Equipment)

```json
POST /ancillary/baggage
{
  "bookingId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "type": "special",
  "specialCategory": "sports_equipment",
  "weight": 15.0,
  "length": 120,
  "width": 30,
  "height": 30,
  "quantity": 1,
  "price": 75.00,
  "currency": "USD",
  "description": "Golf clubs set"
}
```

### Example 3: Add Meal Service

```json
POST /ancillary/in-flight-services
{
  "bookingId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "passengerId": "passenger-uuid-here",
  "type": "meal",
  "mealType": "vegetarian",
  "serviceName": "Vegetarian Meal",
  "description": "Vegetarian meal option",
  "price": 15.00,
  "currency": "USD",
  "quantity": 1,
  "specialRequirements": "No dairy products"
}
```

### Example 4: Add Wi-Fi Service

```json
POST /ancillary/in-flight-services
{
  "bookingId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "type": "wifi",
  "serviceName": "Wi-Fi 24hrs",
  "description": "24-hour internet access",
  "price": 12.00,
  "currency": "USD",
  "quantity": 1
}
```

### Example 5: Add Travel Insurance

```json
POST /ancillary/travel-insurance
{
  "bookingId": "f3cae1ab-ec9a-4cb5-b124-553cf37e22f7",
  "type": "comprehensive",
  "policyName": "Comprehensive Travel Protection",
  "description": "Full coverage including trip cancellation, medical, and baggage",
  "coverageAmount": 10000.00,
  "currency": "USD",
  "premium": 75.00,
  "startDate": "2024-01-15T10:00:00Z",
  "endDate": "2024-01-20T18:00:00Z",
  "provider": "TravelGuard",
  "termsAndConditions": "Coverage terms apply..."
}
```

### Example 6: Get All Ancillary Services for a Booking

```json
GET /bookings/:id/ancillary
```

**Response:**
```json
{
  "baggage": [
    {
      "id": "baggage-uuid-1",
      "type": "checked",
      "weight": 23.5,
      "price": 50.00,
      "quantity": 1
    }
  ],
  "inFlightServices": [
    {
      "id": "service-uuid-1",
      "type": "meal",
      "mealType": "vegetarian",
      "price": 15.00,
      "quantity": 1
    },
    {
      "id": "service-uuid-2",
      "type": "wifi",
      "price": 12.00,
      "quantity": 1
    }
  ],
  "travelInsurance": [
    {
      "id": "insurance-uuid-1",
      "type": "comprehensive",
      "premium": 75.00,
      "status": "active"
    }
  ],
  "totals": {
    "baggage": 50.00,
    "inFlightServices": 27.00,
    "travelInsurance": 75.00,
    "total": 152.00
  }
}
```

### Example 7: Update Baggage

```json
PATCH /ancillary/baggage/:id
{
  "weight": 25.0,
  "price": 60.00
}
```

### Example 8: Remove In-Flight Service

```json
DELETE /ancillary/in-flight-services/:id
```

## Best Practices

### 1. Service Assignment

- **Booking-Level**: Use when service applies to entire booking (e.g., lounge access for all passengers)
- **Passenger-Specific**: Use when service is for a specific passenger (e.g., special meal, wheelchair assistance)

### 2. Pricing

- Always specify currency explicitly
- Calculate totals including quantity (price × quantity)
- Consider currency conversion for international bookings

### 3. Validation

- Always validate booking exists before adding services
- Validate passenger belongs to booking if passengerId is provided
- Validate dates for travel insurance (endDate > startDate)
- Validate dimensions and weights are positive

### 4. Special Requirements

- Store special requirements (dietary, medical, etc.) in `specialRequirements` or `notes` fields
- Provide clear descriptions for special baggage
- Document terms and conditions for travel insurance

### 5. Status Management

- Track insurance status appropriately
- Consider automatic status updates based on dates
- Update status when services are cancelled or claimed

### 6. Integration

- Add ancillary services after booking creation
- Calculate total booking amount including ancillary services
- Include ancillary services in booking confirmation
- Consider refund policies for ancillary services

### 7. Error Handling

- Return appropriate HTTP status codes (404 for not found, 400 for bad request)
- Provide clear error messages
- Validate all required fields before processing

## Summary

The Ancillary Services module provides comprehensive support for:

- **Baggage Management**: Cabin, checked, excess, and special baggage with weight and dimension tracking
- **In-Flight Services**: Meals, entertainment, Wi-Fi, priority boarding, lounge access with quantity management
- **Travel Insurance**: Multiple insurance types with coverage tracking and status management

All services are:
- Integrated with the booking system
- Support both booking-level and passenger-specific assignment
- Include pricing and currency management
- Provide comprehensive API endpoints
- Include validation and error handling

This implementation enables airlines to offer additional services and generate ancillary revenue while providing passengers with enhanced travel experiences.

