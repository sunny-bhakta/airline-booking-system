# Documentation Index

Welcome to the Airline Booking System documentation. This index provides an overview of all available documentation and guides.

## 📚 Documentation Structure

### Core Concepts

- **[Airline Booking Concepts](airline-booking-concepts.md)**
  - Comprehensive overview of all concepts required for an airline booking system
  - Covers 18 major domains from flight management to DevOps
  - Reference document for understanding the full scope of the system

### Implementation Guides

- **[Flight Management Implementation](flight-management-implementation.md)**
  - Complete guide to the Flight Management module (Section 1.1)
  - Entity structure, API endpoints, business logic
  - Database schema and relationships
  - Usage examples and testing

- **[Booking Management Implementation](booking-management-implementation.md)**
  - Complete guide to the Booking & Reservation module (Section 1.3)
  - Booking workflow, PNR generation, ticket management
  - Seat assignment, status transitions
  - Complete API reference and examples

- **[Booking Flow Implementation](07-booking-flow-implementation.md)**
  - Complete end-to-end booking flow guide (Section 4)
  - Step-by-step booking process from search to confirmation
  - API reference with request/response examples
  - Status management and transitions
  - PNR and ticket generation details
  - Seat assignment workflow
  - Error handling and best practices

- **[Payment & Billing Implementation](08-payment-billing-implementation.md)**
  - Complete payment and billing system guide (Section 5)
  - Payment processing with multiple payment methods
  - Transaction management and tracking
  - Invoice and receipt generation
  - Refund processing (full and partial)
  - Payment gateway integration (ready for production)
  - Complete API reference and examples

### Setup & Configuration

- **[Seeding Guide](SEEDING-GUIDE.md)**
  - How to seed the database with test data
  - Available seeders and data structures
  - Clearing and resetting database

- **[API Testing Guide](API-TESTING-GUIDE.md)**
  - How to test the API using various tools
  - Swagger UI, Postman, REST Client, cURL
  - Example requests and responses

## 🚀 Quick Start

1. **Read the Concepts:** Start with [Airline Booking Concepts](00-airline-booking-concepts.md) to understand the domain
2. **Review Implementation:** Check [Flight Management](01-flight-management-implementation.md), [Booking Management](03-booking-management-implementation.md), [Booking Flow](07-booking-flow-implementation.md), and [Payment & Billing](08-payment-billing-implementation.md) guides
3. **Set Up Database:** Follow [Seeding Guide](SEEDING-GUIDE.md) to populate test data
4. **Test API:** Use [API Testing Guide](API-TESTING-GUIDE.md) to explore endpoints

## 📋 Module Status

### ✅ Implemented

- **Flight Management** (Section 1.1)
  - Flight, Route, Schedule, Aircraft, Airport entities
  - Flight search and availability
  - Seat inventory management
  - Status tracking

- **Booking & Reservation** (Section 1.3)
  - Booking with PNR generation
  - Passenger management
  - Ticket generation
  - Seat assignment
  - Booking status workflow

- **Payment & Billing** (Section 5)
  - Payment processing (cards, digital wallets, UPI, bank transfer)
  - Transaction management
  - Invoice and receipt generation
  - Refund processing (full and partial)
  - Payment gateway integration ready

### 🚧 Planned

- **Pricing & Fare** (Section 1.4)
- **User Management** (Section 2)
- **Payment & Billing** (Section 5)
- **Check-in & Boarding** (Section 7)
- **Modifications & Cancellations** (Section 8)
- **Loyalty & Rewards** (Section 9)

## 🔍 Finding Information

### By Topic

**Flight Operations:**
- Creating flights: [Flight Management](flight-management-implementation.md#flight-creation)
- Searching flights: [Flight Management](flight-management-implementation.md#flight-search)
- Flight status: [Flight Management](flight-management-implementation.md#status-management)

**Booking Operations:**
- Complete booking flow: [Booking Flow](07-booking-flow-implementation.md)
- Creating bookings: [Booking Flow](07-booking-flow-implementation.md#step-2-create-booking) or [Booking Management](03-booking-management-implementation.md#booking-creation)
- PNR lookup: [Booking Flow](07-booking-flow-implementation.md#retrieve-booking) or [Booking Management](03-booking-management-implementation.md#pnr-lookup)
- Seat assignment: [Booking Flow](07-booking-flow-implementation.md#seat-assignment) or [Booking Management](03-booking-management-implementation.md#seat-assignment)
- Ticket generation: [Booking Flow](07-booking-flow-implementation.md#pnr--ticket-generation) or [Booking Management](03-booking-management-implementation.md#booking-confirmation)
- Status management: [Booking Flow](07-booking-flow-implementation.md#status-management)

**Database:**
- Seeding data: [Seeding Guide](SEEDING-GUIDE.md)
- Entity relationships: [Flight Management](flight-management-implementation.md#database-schema) and [Booking Management](booking-management-implementation.md#database-schema)

**API Testing:**
- Swagger UI: [API Testing Guide](API-TESTING-GUIDE.md#swagger-ui)
- Postman: [API Testing Guide](API-TESTING-GUIDE.md#postman)
- cURL: [API Testing Guide](API-TESTING-GUIDE.md#curl)

### By Use Case

**I want to...**

- **Set up the project:** Read [Seeding Guide](SEEDING-GUIDE.md) and main [README](../README.md)
- **Understand the domain:** Read [Airline Booking Concepts](airline-booking-concepts.md)
- **Create a flight:** See [Flight Management](flight-management-implementation.md#example-requests)
- **Create a booking:** See [Booking Flow](07-booking-flow-implementation.md#complete-examples) or [Booking Management](03-booking-management-implementation.md#usage-example)
- **Process payment:** See [Payment & Billing](08-payment-billing-implementation.md#complete-examples)
- **Process refund:** See [Payment & Billing](08-payment-billing-implementation.md#refund-processing)
- **Test the API:** See [API Testing Guide](API-TESTING-GUIDE.md)
- **Understand entities:** See entity sections in implementation guides
- **See API endpoints:** See API Endpoints sections in implementation guides

## 📖 Document Details

| Document | Purpose | Audience |
|----------|---------|----------|
| [Airline Booking Concepts](00-airline-booking-concepts.md) | Reference for all concepts | All |
| [Flight Management](01-flight-management-implementation.md) | Flight module implementation | Developers |
| [Booking Management](03-booking-management-implementation.md) | Booking module implementation | Developers |
| [Booking Flow](07-booking-flow-implementation.md) | End-to-end booking process | Developers, QA |
| [Payment & Billing](08-payment-billing-implementation.md) | Payment processing and billing | Developers, QA |
| [Seeding Guide](SEEDING-GUIDE.md) | Database setup | Developers, QA |
| [API Testing Guide](API-TESTING-GUIDE.md) | API testing methods | Developers, QA, Testers |

## 🔗 Related Resources

- **Main README:** [../README.md](../README.md) - Project overview and setup
- **Swagger UI:** `http://localhost:3000/api` - Interactive API documentation
- **Source Code:** [../src/](../src/) - Implementation code

## 📝 Contributing to Documentation

When adding new features:

1. Update the relevant implementation guide
2. Add examples to the API Testing Guide if needed
3. Update this index if adding new documents
4. Update the main README with new endpoints

## 🆘 Getting Help

- Check the relevant implementation guide for your question
- Review the API Testing Guide for endpoint examples
- Check Swagger UI for up-to-date API documentation
- Review the source code in `src/` directory

---

**Last Updated:** See individual document headers for last update dates.

