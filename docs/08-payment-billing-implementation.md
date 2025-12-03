# Payment & Billing Implementation Guide

## Overview

This document provides a comprehensive guide to the **Payment & Billing** system (Section 5) from the airline booking concepts. It covers payment processing, transaction management, invoice generation, receipt creation, and refund processing.

## Table of Contents

1. [Payment Flow Overview](#payment-flow-overview)
2. [Architecture](#architecture)
3. [Payment Processing](#payment-processing)
4. [Transaction Management](#transaction-management)
5. [Invoice & Receipt Generation](#invoice--receipt-generation)
6. [Refund Processing](#refund-processing)
7. [Data Models](#data-models)
8. [API Reference](#api-reference)
9. [Error Handling](#error-handling)
10. [Integration Points](#integration-points)
11. [Best Practices](#best-practices)
12. [Complete Examples](#complete-examples)

## Payment Flow Overview

The payment flow integrates with the booking flow to complete the transaction:

```
┌──────────────┐
│ Create       │
│ Booking      │
│ (PENDING)    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Process      │
│ Payment      │
│ POST /payments/process│
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ Payment      │  │ Payment      │
│ Success      │  │ Failed       │
└──────┬───────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ Generate     │
│ Invoice      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Generate     │
│ Receipt      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Update       │
│ Booking      │
│ (CONFIRMED)  │
└──────────────┘
```

## Architecture

The Payment & Billing module is implemented as a feature module in NestJS.

### Module Structure

```
src/payments/
├── entities/              # Database entities
│   ├── payment-transaction.entity.ts
│   ├── invoice.entity.ts
│   ├── receipt.entity.ts
│   └── index.ts
├── dto/                    # Data Transfer Objects
│   ├── process-payment.dto.ts
│   ├── refund-payment.dto.ts
│   ├── create-invoice.dto.ts
│   ├── search-payments.dto.ts
│   └── index.ts
├── payments.controller.ts
├── payments.service.ts
└── payments.module.ts
```

## Payment Processing

### Process Payment API

**Endpoint**: `POST /payments/process`

**Request Body** (`ProcessPaymentDto`):
```typescript
{
  bookingId: string;              // Required - Booking UUID
  userId?: string;                // Optional - User UUID
  paymentMethodId?: string;       // Optional - Saved payment method UUID
  paymentMethodType: string;      // Required - credit_card, debit_card, digital_wallet, etc.
  amount: number;                 // Required - Payment amount
  currency?: string;              // Optional - Default: USD
  
  // Card details (if not using saved payment method)
  cardDetails?: {
    cardNumber: string;
    cardHolderName: string;
    expiryMonth: string;          // MM
    expiryYear: string;           // YYYY
    cvv: string;
  };
  
  // Digital wallet details
  walletProvider?: string;        // PayPal, Apple Pay, Google Pay
  walletToken?: string;
  
  // Bank transfer / UPI / Net Banking
  accountNumber?: string;
  bankName?: string;
  upiId?: string;
  
  // Billing information
  billingName?: string;
  billingEmail?: string;
  billingPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  
  notes?: string;
  paymentGateway?: string;         // Stripe, PayPal, Razorpay, etc.
}
```

**Response**:
```json
{
  "transaction": {
    "id": "transaction-uuid",
    "transactionId": "TXN1234567890",
    "bookingId": "booking-uuid",
    "status": "completed",
    "type": "booking_payment",
    "amount": 500.00,
    "currency": "USD",
    "paymentGateway": "mock_gateway",
    "gatewayTransactionId": "GW-1234567890",
    "processedAt": "2024-12-01T10:40:00Z"
  },
  "invoice": {
    "id": "invoice-uuid",
    "invoiceNumber": "INV-2024-001234",
    "bookingId": "booking-uuid",
    "status": "paid",
    "subtotal": 500.00,
    "taxes": 50.00,
    "fees": 25.00,
    "totalAmount": 575.00,
    "invoiceDate": "2024-12-01T10:40:00Z",
    "paidDate": "2024-12-01T10:40:00Z"
  },
  "receipt": {
    "id": "receipt-uuid",
    "receiptNumber": "RCP-2024-001234",
    "bookingId": "booking-uuid",
    "amount": 575.00,
    "paymentMethod": "Visa ending in 1111",
    "receiptDate": "2024-12-01T10:40:00Z"
  },
  "booking": {
    "id": "booking-uuid",
    "status": "confirmed",
    "confirmationDate": "2024-12-01T10:40:00Z"
  }
}
```

**Business Logic**:
1. Validates booking exists and is in PENDING status
2. Validates payment amount matches booking amount
3. Validates user and payment method if provided
4. Generates unique transaction ID
5. Processes payment through payment gateway (mock implementation)
6. Creates payment transaction record
7. Updates booking status to CONFIRMED
8. Generates invoice automatically
9. Generates receipt automatically
10. Returns complete payment details

**Payment Method Types**:
- `credit_card`: Credit card payment
- `debit_card`: Debit card payment
- `digital_wallet`: Digital wallet (PayPal, Apple Pay, Google Pay)
- `bank_transfer`: Bank transfer
- `upi`: UPI payment
- `net_banking`: Net banking

### Payment Gateway Integration

Currently, the system uses a **mock payment gateway** for demonstration purposes. In production, this would integrate with:

- **Stripe**: Credit/debit cards, digital wallets
- **PayPal**: PayPal, credit cards
- **Razorpay**: UPI, net banking, cards (India)
- **Square**: Cards, digital wallets
- **Adyen**: Multi-payment methods

**Mock Gateway Behavior**:
- Simulates 5% payment failure rate
- Generates mock gateway transaction IDs
- Processes payments with 500ms delay
- Returns success/failure response

## Transaction Management

### Payment Transaction Entity

**Key Fields**:
- `transactionId`: Unique transaction identifier (e.g., TXN1234567890)
- `bookingId`: Reference to booking
- `userId`: Reference to user (optional for guest payments)
- `paymentMethodId`: Reference to saved payment method (optional)
- `status`: Payment status enum
- `type`: Payment type enum
- `amount`: Payment amount
- `currency`: Currency code
- `refundedAmount`: Total amount refunded
- `paymentGateway`: Payment gateway name
- `gatewayTransactionId`: Transaction ID from payment gateway
- `gatewayResponse`: JSON response from payment gateway
- `failureReason`: Reason for payment failure
- `processedAt`: When payment was processed
- `refundedAt`: When refund was processed

**Payment Status Flow**:
```
PENDING → PROCESSING → COMPLETED
                          ↓
                      REFUNDED / PARTIALLY_REFUNDED

PENDING → PROCESSING → FAILED
```

**Payment Statuses**:
- `PENDING`: Payment initiated but not processed
- `PROCESSING`: Payment being processed by gateway
- `COMPLETED`: Payment successfully processed
- `FAILED`: Payment processing failed
- `CANCELLED`: Payment cancelled before processing
- `REFUNDED`: Full refund processed
- `PARTIALLY_REFUNDED`: Partial refund processed

**Payment Types**:
- `BOOKING_PAYMENT`: Payment for booking
- `REFUND`: Full refund
- `PARTIAL_REFUND`: Partial refund
- `INSTALLMENT`: Installment payment (future)

### Search Payment Transactions

**Endpoint**: `GET /payments/search`

**Query Parameters**:
- `bookingId`: Filter by booking ID
- `userId`: Filter by user ID
- `status`: Filter by payment status
- `type`: Filter by payment type
- `paymentGateway`: Filter by payment gateway
- `transactionId`: Search by transaction ID (partial match)
- `dateFrom`: Start date filter (YYYY-MM-DD)
- `dateTo`: End date filter (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response**:
```json
{
  "transactions": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

## Invoice & Receipt Generation

### Invoice Generation

Invoices are automatically generated when a payment is successfully processed.

**Invoice Entity**:
- `invoiceNumber`: Unique invoice number (e.g., INV-2024-001234)
- `bookingId`: Reference to booking
- `status`: Invoice status (draft, issued, paid, cancelled, overdue)
- `invoiceDate`: Invoice issue date
- `dueDate`: Payment due date
- `paidDate`: When invoice was paid
- `subtotal`: Base fare amount
- `taxes`: Total taxes
- `fees`: Total fees
- `discount`: Discount amount
- `totalAmount`: Total amount due
- `billingName`, `billingEmail`, `billingPhone`: Billing contact
- `billingAddress`, `billingCity`, `billingState`, `billingPostalCode`, `billingCountry`: Billing address
- `taxBreakdown`: JSON array of tax details

**Invoice Statuses**:
- `DRAFT`: Invoice draft (not yet issued)
- `ISSUED`: Invoice issued to customer
- `PAID`: Invoice paid
- `CANCELLED`: Invoice cancelled
- `OVERDUE`: Payment overdue

**Get Invoice**: `GET /payments/invoice/:id`
**Get Invoice by Number**: `GET /payments/invoice-number/:invoiceNumber`

### Receipt Generation

Receipts are automatically generated after successful payment processing.

**Receipt Entity**:
- `receiptNumber`: Unique receipt number (e.g., RCP-2024-001234)
- `bookingId`: Reference to booking
- `paymentTransactionId`: Reference to payment transaction
- `invoiceId`: Reference to invoice
- `receiptDate`: Receipt issue date
- `amount`: Payment amount
- `currency`: Currency code
- `paymentMethod`: Payment method display name
- `paymentReference`: Transaction ID or reference
- `subtotal`, `taxes`, `fees`, `discount`: Amount breakdown
- `taxBreakdown`: JSON array of tax details
- `isEmailed`: Whether receipt was emailed
- `emailedAt`: When receipt was emailed

**Get Receipt**: `GET /payments/receipt/:id`
**Get Receipt by Number**: `GET /payments/receipt-number/:receiptNumber`

## Refund Processing

### Process Refund API

**Endpoint**: `POST /payments/refund`

**Request Body** (`RefundPaymentDto`):
```json
{
  "paymentTransactionId": "transaction-uuid",
  "amount": 250.00,              // Optional - if not provided, full refund
  "reason": "Customer cancellation",
  "notes": "Refund processed per customer request"
}
```

**Response**:
```json
{
  "transaction": {
    "id": "original-transaction-uuid",
    "status": "refunded",
    "refundedAmount": 500.00,
    "refundedAt": "2024-12-02T14:30:00Z"
  },
  "refundTransaction": {
    "id": "refund-transaction-uuid",
    "transactionId": "REF-TXN1234567890",
    "type": "refund",
    "status": "completed",
    "amount": 500.00,
    "refundReason": "Customer cancellation",
    "processedAt": "2024-12-02T14:30:00Z"
  }
}
```

**Business Logic**:
1. Validates original payment transaction exists
2. Validates transaction can be refunded (status must be COMPLETED)
3. Validates refund amount doesn't exceed available amount
4. Generates unique refund transaction ID
5. Processes refund through payment gateway (mock)
6. Creates refund transaction record
7. Updates original transaction status and refunded amount
8. Updates booking status to CANCELLED if full refund

**Refund Types**:
- **Full Refund**: Refund amount equals original payment amount
  - Updates transaction status to `REFUNDED`
  - Updates booking status to `CANCELLED`
- **Partial Refund**: Refund amount less than original payment amount
  - Updates transaction status to `PARTIALLY_REFUNDED`
  - Booking remains `CONFIRMED`

## Data Models

### Payment Transaction

**Relationships**:
- Many-to-One with Booking
- Many-to-One with User (optional)
- Many-to-One with PaymentMethod (optional)

**Indexes**:
- Unique index on `transactionId`
- Composite index on `bookingId` and `status`
- Composite index on `userId` and `createdAt`

### Invoice

**Relationships**:
- Many-to-One with Booking
- Many-to-One with User (optional)

**Indexes**:
- Unique index on `invoiceNumber`
- Index on `bookingId`
- Composite index on `userId` and `invoiceDate`

### Receipt

**Relationships**:
- Many-to-One with Booking
- Many-to-One with User (optional)
- Many-to-One with PaymentTransaction
- Many-to-One with Invoice

**Indexes**:
- Unique index on `receiptNumber`
- Index on `bookingId`
- Composite index on `userId` and `receiptDate`

## API Reference

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/process` | Process payment for booking |
| POST | `/payments/refund` | Process refund for payment |
| GET | `/payments/search` | Search payment transactions |
| GET | `/payments/transaction/:id` | Get transaction by ID |
| GET | `/payments/transaction-id/:transactionId` | Get transaction by transaction ID |

### Invoice Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/invoice/:id` | Get invoice by ID |
| GET | `/payments/invoice-number/:invoiceNumber` | Get invoice by invoice number |
| GET | `/payments/booking/:bookingId/invoices` | Get all invoices for booking |

### Receipt Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/receipt/:id` | Get receipt by ID |
| GET | `/payments/receipt-number/:receiptNumber` | Get receipt by receipt number |
| GET | `/payments/booking/:bookingId/receipts` | Get all receipts for booking |

## Error Handling

### Common Error Scenarios

**Booking Not Found**:
- **Error**: `404 Not Found`
- **Message**: "Booking not found"
- **Action**: Validate booking exists before processing payment

**Invalid Booking Status**:
- **Error**: `400 Bad Request`
- **Message**: "Cannot process payment for booking with status: [status]"
- **Action**: Only PENDING bookings can be paid

**Amount Mismatch**:
- **Error**: `400 Bad Request`
- **Message**: "Payment amount does not match booking amount"
- **Action**: Validate payment amount matches booking total

**Payment Method Not Found**:
- **Error**: `404 Not Found`
- **Message**: "Payment method not found"
- **Action**: Validate payment method exists when using saved method

**Payment Processing Failed**:
- **Error**: Payment transaction created with status `FAILED`
- **Message**: Stored in `failureReason` field
- **Action**: Transaction recorded but booking remains PENDING

**Refund Amount Exceeds Available**:
- **Error**: `400 Bad Request`
- **Message**: "Refund amount exceeds available amount"
- **Action**: Validate refund amount doesn't exceed original amount minus already refunded

**Transaction Cannot Be Refunded**:
- **Error**: `400 Bad Request`
- **Message**: "Cannot refund transaction with status: [status]"
- **Action**: Only COMPLETED transactions can be refunded

## Integration Points

### Current Integrations

**Booking Service**:
- Validates booking before payment
- Updates booking status to CONFIRMED after successful payment
- Updates booking status to CANCELLED after full refund

**User Service**:
- Validates user if provided
- Links payment to user account
- Enables user-specific payment queries

**Payment Method Service**:
- Validates saved payment methods
- Retrieves payment method details

### Future Integrations

**Payment Gateways**:
- Stripe integration for cards and digital wallets
- PayPal integration
- Razorpay integration (India)
- Square integration
- Adyen integration

**Email Service**:
- Send payment confirmation emails
- Send invoice emails
- Send receipt emails
- Send refund confirmation emails

**SMS Service**:
- Send payment confirmation SMS
- Send transaction alerts
- Send refund notifications

**Notification Service**:
- Real-time payment status updates
- Push notifications for mobile apps
- WebSocket updates for web apps

**PDF Generation**:
- Generate invoice PDFs
- Generate receipt PDFs
- Email PDF attachments

## Best Practices

### Payment Processing

1. **Always validate booking** before processing payment
2. **Validate payment amount** matches booking amount
3. **Use idempotency keys** for payment requests (prevent duplicate charges)
4. **Store gateway responses** for audit trail
5. **Handle payment failures gracefully** (don't update booking on failure)
6. **Generate invoices and receipts** automatically after successful payment
7. **Use transactions** for payment processing to ensure data consistency

### Security

1. **Never store full card numbers** - only last 4 digits
2. **Never store CVV** - process and discard immediately
3. **Use PCI DSS compliant** payment gateways
4. **Encrypt sensitive payment data** at rest and in transit
5. **Validate all input data** to prevent injection attacks
6. **Implement rate limiting** on payment endpoints
7. **Log all payment operations** for audit purposes

### Refund Processing

1. **Validate refund eligibility** before processing
2. **Check available refund amount** before processing
3. **Update original transaction** with refund details
4. **Update booking status** if full refund
5. **Store refund reason** for audit trail
6. **Notify customer** of refund processing

### Invoice & Receipt

1. **Generate invoices automatically** after payment
2. **Generate receipts automatically** after payment
3. **Use unique invoice/receipt numbers** for tracking
4. **Include complete amount breakdown** (subtotal, taxes, fees)
5. **Store billing information** for tax purposes
6. **Email invoices and receipts** to customers

## Complete Examples

### Example 1: Credit Card Payment

```bash
# Step 1: Create booking (PENDING status)
POST /bookings
{
  "flightId": "flight-uuid",
  "passengers": [...],
  "totalAmount": 500.00,
  "currency": "USD"
}

# Response includes booking with PNR

# Step 2: Process payment
POST /payments/process
{
  "bookingId": "booking-uuid",
  "paymentMethodType": "credit_card",
  "amount": 500.00,
  "currency": "USD",
  "cardDetails": {
    "cardNumber": "4111111111111111",
    "cardHolderName": "John Doe",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123"
  },
  "billingName": "John Doe",
  "billingEmail": "john.doe@example.com",
  "billingPhone": "+1234567890",
  "billingAddress": "123 Main St",
  "billingCity": "New York",
  "billingState": "NY",
  "billingPostalCode": "10001",
  "billingCountry": "USA"
}

# Response includes:
# - Payment transaction (status: completed)
# - Invoice (status: paid)
# - Receipt
# - Updated booking (status: confirmed)
```

### Example 2: Saved Payment Method

```bash
# Process payment using saved payment method
POST /payments/process
{
  "bookingId": "booking-uuid",
  "userId": "user-uuid",
  "paymentMethodId": "payment-method-uuid",
  "paymentMethodType": "credit_card",
  "amount": 500.00,
  "currency": "USD"
}

# Payment processed using saved card details
```

### Example 3: Digital Wallet Payment

```bash
POST /payments/process
{
  "bookingId": "booking-uuid",
  "paymentMethodType": "digital_wallet",
  "walletProvider": "PayPal",
  "walletToken": "paypal-token-123",
  "amount": 500.00,
  "currency": "USD"
}
```

### Example 4: Full Refund

```bash
# Process full refund
POST /payments/refund
{
  "paymentTransactionId": "transaction-uuid",
  "reason": "Customer cancellation",
  "notes": "Refund processed per customer request"
}

# Response includes:
# - Updated original transaction (status: refunded)
# - New refund transaction
# - Updated booking (status: cancelled)
```

### Example 5: Partial Refund

```bash
# Process partial refund
POST /payments/refund
{
  "paymentTransactionId": "transaction-uuid",
  "amount": 250.00,
  "reason": "Partial cancellation - one passenger",
  "notes": "One passenger cancelled, refunding their portion"
}

# Response includes:
# - Updated original transaction (status: partially_refunded)
# - New refund transaction
# - Booking remains confirmed
```

### Example 6: Search Payment Transactions

```bash
# Search by booking
GET /payments/search?bookingId=booking-uuid

# Search by user
GET /payments/search?userId=user-uuid&status=completed

# Search by date range
GET /payments/search?dateFrom=2024-12-01&dateTo=2024-12-31&status=completed

# Search with pagination
GET /payments/search?page=1&limit=20&status=completed
```

### Example 7: Get Invoice and Receipt

```bash
# Get invoice by number
GET /payments/invoice-number/INV-2024-001234

# Get receipt by number
GET /payments/receipt-number/RCP-2024-001234

# Get all invoices for booking
GET /payments/booking/booking-uuid/invoices

# Get all receipts for booking
GET /payments/booking/booking-uuid/receipts
```

## Related Documentation

- [Booking Flow Implementation](07-booking-flow-implementation.md) - Complete booking flow
- [Booking Management Implementation](03-booking-management-implementation.md) - Booking module details
- [Airline Booking Concepts](00-airline-booking-concepts.md) - Complete domain concepts

## Summary

The Payment & Billing system provides a complete solution for processing payments, managing transactions, generating invoices and receipts, and handling refunds. Key features include:

- **Payment Processing**: Support for multiple payment methods (cards, digital wallets, bank transfer, UPI)
- **Transaction Management**: Complete transaction lifecycle tracking
- **Invoice Generation**: Automatic invoice creation with tax breakdown
- **Receipt Generation**: Automatic receipt creation after payment
- **Refund Processing**: Full and partial refund support
- **Payment Gateway Integration**: Ready for production gateway integration
- **Security**: PCI DSS compliant design (with proper gateway integration)

The implementation follows best practices for security, data integrity, and error handling, ensuring a reliable and secure payment processing system.

