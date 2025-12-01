# Pricing & Fare Implementation Guide

## Overview

This document explains how **1.4 Pricing & Fare** from the airline booking concepts has been implemented in the NestJS application.

## Architecture

The Pricing & Fare module is implemented as a feature module in NestJS following Domain-Driven Design principles.

### Module Structure

```
src/pricing/
├── entities/              # Database entities
│   ├── fare.entity.ts
│   ├── fare-rule.entity.ts
│   ├── tax-fee.entity.ts
│   ├── promotional-code.entity.ts
│   └── index.ts
├── dto/                   # Data Transfer Objects
│   ├── create-fare.dto.ts
│   ├── update-fare.dto.ts
│   ├── create-fare-rule.dto.ts
│   ├── create-tax-fee.dto.ts
│   ├── create-promotional-code.dto.ts
│   ├── calculate-price.dto.ts
│   ├── validate-promotional-code.dto.ts
│   └── index.ts
├── pricing.controller.ts
├── pricing.service.ts
└── pricing.module.ts
```

## Core Concepts Implementation

### 1. Fare Entity

Represents the price for a flight segment with different fare classes.

**Key Features:**
- Links to Flight and optionally Route
- Supports multiple fare classes (Economy, Premium Economy, Business, First)
- Base fare and dynamic price adjustment
- Seat availability tracking per fare class
- Validity periods

**Fields:**
- `flightId`: Reference to Flight entity
- `routeId`: Optional route-based pricing
- `fareClass`: Enum (Economy, Premium Economy, Business, First)
- `baseFare`: Core ticket price
- `dynamicPriceAdjustment`: Price adjustment based on demand/time
- `totalFare`: Calculated total (baseFare + dynamicPriceAdjustment)
- `availableSeats` / `bookedSeats`: Seat inventory per fare class
- `currency`: Currency code (default: USD)
- `isActive`: Active status
- `validFrom` / `validTo`: Validity period

### 2. Fare Rule Entity

Defines restrictions, refundability, and changeability rules for a fare.

**Key Features:**
- Refundability rules (refundable, non-refundable, refund fees, deadlines)
- Changeability rules (changeable, non-changeable, change fees, deadlines)
- Advance purchase requirements
- Minimum/maximum stay requirements
- Name change policies

**Fields:**
- `fareId`: Reference to Fare entity
- `isRefundable` / `isNonRefundable`: Refundability flags
- `refundFee` / `refundDeadlineDays`: Refund rules
- `isChangeable` / `isNonChangeable`: Changeability flags
- `changeFee` / `changeDeadlineDays`: Change rules
- `requiresAdvancePurchase` / `advancePurchaseDays`: Advance booking rules
- `requiresMinimumStay` / `minimumStayDays`: Minimum stay rules
- `requiresMaximumStay` / `maximumStayDays`: Maximum stay rules
- `allowsNameChange` / `nameChangeFee`: Name change rules
- `restrictions` / `termsAndConditions`: Additional text rules

### 3. Tax & Fee Entity

Represents various taxes and fees applied to fares.

**Key Features:**
- Multiple tax/fee types (Airport Tax, Fuel Surcharge, Service Fee, etc.)
- Flexible calculation methods (fixed, percentage, per passenger)
- Min/max amount constraints for percentage calculations

**Fields:**
- `fareId`: Reference to Fare entity
- `type`: Enum (Airport Tax, Fuel Surcharge, Service Fee, Security Fee, etc.)
- `name`: Descriptive name
- `calculationType`: Enum (fixed, percentage, per_passenger)
- `amount`: Fixed amount or percentage value
- `minAmount` / `maxAmount`: Constraints for percentage calculations
- `currency`: Currency code
- `isActive`: Active status
- `description`: Additional details

### 4. Promotional Code Entity

Manages discount codes and promotional offers.

**Key Features:**
- Multiple discount types (percentage, fixed amount, free service)
- Usage limits (max uses, max uses per user)
- Validity periods
- Minimum purchase requirements
- Fare class restrictions
- First-time user only option

**Fields:**
- `code`: Unique promotional code
- `name`: Display name
- `type`: Enum (percentage, fixed_amount, free_service)
- `discountValue`: Percentage (0-100) or fixed amount
- `maxDiscountAmount`: Maximum discount for percentage types
- `minPurchaseAmount`: Minimum purchase to use code
- `status`: Enum (active, inactive, expired, used_up)
- `validFrom` / `validTo`: Validity period
- `maxUses` / `currentUses`: Usage tracking
- `maxUsesPerUser`: Per-user limit
- `applicableFareClass`: Specific fare class restriction
- `isFirstTimeUserOnly`: First-time user restriction
- `termsAndConditions`: Additional terms

## Business Logic

### Dynamic Pricing Algorithm

The pricing service implements dynamic pricing based on:

1. **Demand-based pricing:**
   - High demand (>80% occupancy): +20% price increase
   - Medium-high demand (60-80%): +10% price increase
   - Low demand (<30%): -10% price decrease

2. **Time-based pricing:**
   - Last minute (<7 days): +15% price increase
   - Short notice (7-14 days): +8% price increase
   - Early booking (>60 days): -5% price decrease

3. **Availability-based pricing:**
   - Adjustments based on remaining seat inventory

### Price Calculation Flow

1. Find fare for flight and fare class
2. Check seat availability
3. Calculate dynamic pricing adjustment
4. Calculate base fare per passenger
5. Calculate taxes and fees:
   - Fixed: amount × passenger count
   - Percentage: (base fare × percentage) × passenger count
   - Per passenger: amount × passenger count
6. Apply promotional code discount (if provided)
7. Calculate total amount

### Promotional Code Validation

Validates promotional codes based on:
- Code existence and status
- Validity period (validFrom/validTo)
- Maximum uses limit
- Minimum purchase amount
- Fare class applicability
- First-time user restriction (if applicable)

## API Endpoints

### Fare Management

- `POST /pricing/fares` - Create a new fare
- `GET /pricing/fares/flight/:flightId` - Get all fares for a flight
- `GET /pricing/fares/:id` - Get fare by ID
- `PUT /pricing/fares/:id` - Update fare
- `DELETE /pricing/fares/:id` - Delete fare

### Fare Rules

- `POST /pricing/fare-rules` - Create fare rule
- `GET /pricing/fare-rules/:fareId` - Get fare rules for a fare

### Tax & Fees

- `POST /pricing/tax-fees` - Create tax/fee
- `GET /pricing/tax-fees/:fareId` - Get taxes and fees for a fare

### Price Calculation

- `POST /pricing/calculate` - Calculate total price for a booking

**Request Body:**
```json
{
  "flightId": "uuid",
  "fareClass": "Economy",
  "passengerCount": 2,
  "promotionalCode": "SUMMER2024",
  "currency": "USD"
}
```

**Response:**
```json
{
  "baseFare": 500.00,
  "dynamicPriceAdjustment": 50.00,
  "subtotal": 1100.00,
  "taxes": 110.00,
  "fees": 55.00,
  "promotionalDiscount": 100.00,
  "totalAmount": 1165.00,
  "currency": "USD",
  "fareClass": "Economy",
  "breakdown": {
    "baseFare": 500.00,
    "dynamicPriceAdjustment": 50.00,
    "taxes": [...],
    "fees": [...],
    "promotionalDiscount": {
      "code": "SUMMER2024",
      "discount": 100.00
    }
  }
}
```

### Promotional Codes

- `POST /pricing/promotional-codes` - Create promotional code
- `GET /pricing/promotional-codes` - Get all promotional codes (optional: `?activeOnly=true`)
- `GET /pricing/promotional-codes/:code` - Get promotional code by code
- `POST /pricing/promotional-codes/validate` - Validate promotional code
- `PUT /pricing/promotional-codes/:id` - Update promotional code
- `DELETE /pricing/promotional-codes/:id` - Delete promotional code

## Usage Examples

### Creating a Fare

```typescript
const fare = await pricingService.createFare({
  flightId: 'flight-uuid',
  fareClass: FareClass.ECONOMY,
  baseFare: 500.00,
  totalFare: 500.00,
  availableSeats: 100,
  currency: 'USD',
});
```

### Adding Fare Rules

```typescript
const fareRule = await pricingService.createFareRule({
  fareId: fare.id,
  isRefundable: true,
  refundFee: 50.00,
  refundDeadlineDays: 7,
  isChangeable: true,
  changeFee: 25.00,
  changeDeadlineDays: 14,
});
```

### Adding Taxes and Fees

```typescript
// Airport Tax (fixed per passenger)
await pricingService.createTaxFee({
  fareId: fare.id,
  type: TaxFeeType.AIRPORT_TAX,
  name: 'JFK Airport Tax',
  calculationType: TaxFeeCalculationType.PER_PASSENGER,
  amount: 15.00,
});

// Fuel Surcharge (percentage)
await pricingService.createTaxFee({
  fareId: fare.id,
  type: TaxFeeType.FUEL_SURCHARGE,
  name: 'Fuel Surcharge',
  calculationType: TaxFeeCalculationType.PERCENTAGE,
  amount: 5.0, // 5%
  minAmount: 10.00,
  maxAmount: 50.00,
});
```

### Creating a Promotional Code

```typescript
const promoCode = await pricingService.createPromotionalCode({
  code: 'SUMMER2024',
  name: 'Summer Sale 2024',
  description: '10% off on all bookings',
  type: PromotionalCodeType.PERCENTAGE,
  discountValue: 10.0,
  maxDiscountAmount: 200.00,
  minPurchaseAmount: 500.00,
  validFrom: '2024-06-01T00:00:00Z',
  validTo: '2024-08-31T23:59:59Z',
  maxUses: 1000,
  maxUsesPerUser: 1,
});
```

### Calculating Price

```typescript
const priceCalculation = await pricingService.calculatePrice({
  flightId: 'flight-uuid',
  fareClass: FareClass.ECONOMY,
  passengerCount: 2,
  promotionalCode: 'SUMMER2024',
  currency: 'USD',
});

console.log(`Total: ${priceCalculation.totalAmount} ${priceCalculation.currency}`);
```

## Integration with Bookings Module

The Pricing module is exported and can be imported by the Bookings module:

```typescript
// In bookings.module.ts
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [
    // ... other imports
    PricingModule,
  ],
})
export class BookingsModule {}
```

The bookings service can then inject and use the pricing service:

```typescript
constructor(
  // ... other dependencies
  private pricingService: PricingService,
) {}
```

## Database Schema

### Fares Table
- `id` (UUID, PK)
- `flightId` (UUID, FK)
- `routeId` (UUID, nullable)
- `fareClass` (VARCHAR)
- `baseFare` (DECIMAL)
- `dynamicPriceAdjustment` (DECIMAL)
- `totalFare` (DECIMAL)
- `availableSeats` (INT)
- `bookedSeats` (INT)
- `currency` (VARCHAR)
- `isActive` (BOOLEAN)
- `validFrom` (DATETIME, nullable)
- `validTo` (DATETIME, nullable)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Fare Rules Table
- `id` (UUID, PK)
- `fareId` (UUID, FK)
- `isRefundable` (BOOLEAN)
- `refundFee` (DECIMAL, nullable)
- `refundDeadlineDays` (INT, nullable)
- `isChangeable` (BOOLEAN)
- `changeFee` (DECIMAL, nullable)
- `changeDeadlineDays` (INT, nullable)
- ... (other rule fields)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Tax Fees Table
- `id` (UUID, PK)
- `fareId` (UUID, FK)
- `type` (VARCHAR)
- `name` (VARCHAR)
- `calculationType` (VARCHAR)
- `amount` (DECIMAL)
- `minAmount` (DECIMAL, nullable)
- `maxAmount` (DECIMAL, nullable)
- `currency` (VARCHAR)
- `isActive` (BOOLEAN)
- `description` (TEXT, nullable)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

### Promotional Codes Table
- `id` (UUID, PK)
- `code` (VARCHAR, UNIQUE)
- `name` (VARCHAR)
- `description` (TEXT, nullable)
- `type` (VARCHAR)
- `discountValue` (DECIMAL, nullable)
- `maxDiscountAmount` (DECIMAL, nullable)
- `minPurchaseAmount` (DECIMAL, nullable)
- `status` (VARCHAR)
- `validFrom` (DATETIME)
- `validTo` (DATETIME)
- `maxUses` (INT, nullable)
- `currentUses` (INT)
- `maxUsesPerUser` (INT, nullable)
- `applicableFareClass` (VARCHAR, nullable)
- `currency` (VARCHAR)
- `isFirstTimeUserOnly` (BOOLEAN)
- `termsAndConditions` (TEXT, nullable)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

## Best Practices

1. **Fare Management:**
   - Create fares for each fare class when creating flights
   - Update dynamic pricing regularly based on demand
   - Monitor seat availability and adjust prices accordingly

2. **Fare Rules:**
   - Define clear refund and change policies
   - Set appropriate deadlines and fees
   - Communicate restrictions clearly to customers

3. **Taxes & Fees:**
   - Keep tax/fee calculations transparent
   - Use appropriate calculation types for different fees
   - Set min/max constraints for percentage-based fees

4. **Promotional Codes:**
   - Set realistic usage limits
   - Monitor code usage and adjust as needed
   - Expire codes promptly after validity period
   - Validate codes before applying discounts

5. **Dynamic Pricing:**
   - Adjust pricing based on real-time demand
   - Consider competitor pricing
   - Balance revenue optimization with customer satisfaction

## Future Enhancements

1. **Advanced Dynamic Pricing:**
   - Machine learning-based demand forecasting
   - Competitor price monitoring
   - Seasonal pricing adjustments
   - Route-specific pricing strategies

2. **Revenue Management:**
   - Yield management algorithms
   - Ancillary revenue tracking
   - Revenue reporting and analytics

3. **Promotional Code Features:**
   - Referral program integration
   - Loyalty program discounts
   - Targeted promotions based on user behavior

4. **Integration:**
   - GDS pricing integration
   - Third-party pricing APIs
   - Real-time price synchronization

---

## Summary

The Pricing & Fare module provides a comprehensive solution for:
- ✅ **Fare Management**: Multiple fare classes with base and dynamic pricing
- ✅ **Fare Rules**: Flexible refund, change, and restriction policies
- ✅ **Taxes & Fees**: Multiple tax/fee types with flexible calculation methods
- ✅ **Dynamic Pricing**: Demand and time-based price adjustments
- ✅ **Promotional Codes**: Discount codes with usage limits and restrictions
- ✅ **Price Calculation**: Complete price breakdown with all components

This implementation covers all aspects of Section 1.4 (Pricing & Fare) from the airline booking concepts document.

