# Database Seeding Guide

## Seeding Order

The seeding follows the correct dependency order:

1. **Infrastructure:**
   - Airports → Terminals → Gates
   - Seat Configurations → Aircraft

2. **Flights:**
   - Routes → Schedules → Flights

3. **Bookings:**
   - Bookings → Passengers → Tickets → Seat Assignments

4. **Pricing:**
   - Promotional Codes (standalone)
   - Fares → Fare Rules → Tax Fees

5. **Users:**
   - Users → User Profiles
   - Payment Methods (depends on Users)
   - Travel Preferences (depends on Users)
   - Loyalty Memberships (depends on Users)

## Running Seeding

### Seed All Data
```bash
npm run seed
```

### Clear All Data
```bash
npm run seed:clear
```

## Seeded User Accounts

The seeding process creates the following test user accounts:

### Admin User
- **Username:** `admin`
- **Email:** `admin@airline.com`
- **Password:** `admin123`
- **Role:** Admin
- **Status:** Active

### Registered Users
- **Username:** `john_doe`
  - **Email:** `john.doe@example.com`
  - **Password:** `password123`
  - **Role:** Registered User
  - **Status:** Active
  - **Profile:** Complete profile with passport info
  - **Payment Methods:** 2 (Credit Card, Debit Card)
  - **Travel Preferences:** Window seat, Business class
  - **Loyalty Memberships:** 2 (SkyMiles Gold, AAdvantage Silver)

- **Username:** `jane_smith`
  - **Email:** `jane.smith@example.com`
  - **Password:** `password123`
  - **Role:** Registered User
  - **Status:** Active
  - **Profile:** Complete profile with dietary preferences
  - **Payment Methods:** 2 (Credit Card, PayPal)
  - **Travel Preferences:** Aisle seat, First class, Lounge access
  - **Loyalty Memberships:** 1 (SkyMiles Platinum)

- **Username:** `customer1`
  - **Email:** `customer1@example.com`
  - **Password:** `password123`
  - **Role:** Customer
  - **Status:** Active
  - **Profile:** Basic profile
  - **Payment Methods:** 1 (UPI)
  - **Travel Preferences:** Exit row, Special assistance
  - **Loyalty Memberships:** 1 (Miles & More Bronze)

### Staff Users
- **Username:** `staff1`
  - **Email:** `staff1@airline.com`
  - **Password:** `staff123`
  - **Role:** Airline Staff
  - **Status:** Active

- **Username:** `agent1`
  - **Email:** `agent1@travel.com`
  - **Password:** `agent123`
  - **Role:** Travel Agent
  - **Status:** Active

### Pending User
- **Username:** `pending_user`
  - **Email:** `pending@example.com`
  - **Password:** `password123`
  - **Role:** Registered User
  - **Status:** Pending Verification
  - **Email Verified:** No

## Notes

- All passwords are hashed using SHA-256 (same as the service)
- User profiles are created for most users with realistic data
- Payment methods include various types (Credit Card, Debit Card, Digital Wallet, UPI)
- Travel preferences demonstrate different seat and meal preferences
- Loyalty memberships show different tiers and programs
- The seeding maintains referential integrity between all entities