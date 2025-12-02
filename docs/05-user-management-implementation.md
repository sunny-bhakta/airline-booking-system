# User Management Implementation Guide

## Overview

This document explains how **2. User Management** from the airline booking concepts has been implemented in the NestJS application.

## Architecture

The User Management module is implemented as a feature module in NestJS following Domain-Driven Design principles.

### Module Structure

```
src/users/
├── entities/              # Database entities
│   ├── user.entity.ts
│   ├── user-profile.entity.ts
│   ├── payment-method.entity.ts
│   ├── travel-preference.entity.ts
│   ├── loyalty-membership.entity.ts
│   └── index.ts
├── dto/                   # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── create-user-profile.dto.ts
│   ├── create-payment-method.dto.ts
│   ├── create-travel-preference.dto.ts
│   ├── create-loyalty-membership.dto.ts
│   ├── search-users.dto.ts
│   └── index.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

## Core Concepts Implementation

### 1. User Entity

The main entity representing system users with authentication and authorization.

**Key Features:**
- User roles (Customer, Guest, Registered User, Admin, Airline Staff, Travel Agent)
- User status management (Active, Inactive, Suspended, Pending Verification)
- Email and username authentication
- Password hashing (SHA-256, can be upgraded to bcrypt)
- Session management with tokens
- Two-factor authentication support
- Email verification tracking

**Fields:**
- `username`: Unique username (optional)
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role enum (customer, guest, registered_user, admin, airline_staff, travel_agent)
- `status`: User status enum (active, inactive, suspended, pending_verification)
- `isEmailVerified`: Email verification flag
- `isTwoFactorEnabled`: 2FA enabled flag
- `twoFactorSecret`: 2FA secret key
- `lastLoginAt`: Last login timestamp
- `lastLoginIp`: Last login IP address
- `sessionToken`: Current session token
- `sessionExpiresAt`: Session expiration time

**Relationships:**
- One-to-One with UserProfile
- One-to-Many with PaymentMethod
- One-to-Many with TravelPreference
- One-to-Many with LoyaltyMembership
- One-to-Many with Booking

### 2. User Profile Entity

Extended personal information for registered users.

**Key Features:**
- Personal information (name, date of birth, gender)
- Contact details (phone, address)
- Passport/ID information
- Emergency contact information
- Special assistance needs
- Dietary preferences

**Fields:**
- `firstName` / `lastName`: Full name
- `dateOfBirth`: Date of birth
- `gender`: Gender (male, female, other)
- `phoneNumber`: Contact number
- `address` / `city` / `state` / `country` / `postalCode`: Address details
- `nationality`: Country of nationality
- `passportNumber`: Passport/ID number
- `passportExpiryDate`: Passport expiration
- `passportIssuingCountry`: Country that issued passport
- `emergencyContactName` / `emergencyContactPhone`: Emergency contact
- `specialAssistance`: Special needs or assistance requirements
- `dietaryPreferences`: Dietary restrictions or preferences

**Relationships:**
- One-to-One with User

### 3. Payment Method Entity

Stored payment methods for users.

**Key Features:**
- Multiple payment method types (Credit Card, Debit Card, Digital Wallet, Bank Transfer, UPI, Net Banking)
- Card information (last 4 digits, brand, expiry)
- Wallet provider information
- Bank account details
- Default payment method flag
- Billing address

**Fields:**
- `type`: Payment method type enum
- `cardHolderName`: Name on card
- `lastFourDigits`: Last 4 digits of card
- `cardBrand`: Card brand (Visa, Mastercard, etc.)
- `expiryDate`: Card expiration date
- `walletProvider`: Digital wallet provider (PayPal, Apple Pay, etc.)
- `accountNumber`: Bank account or UPI ID
- `bankName`: Bank name
- `isDefault`: Default payment method flag
- `isActive`: Active status
- `billingAddress`: Billing address

**Relationships:**
- Many-to-One with User

### 4. Travel Preference Entity

User travel preferences and requirements.

**Key Features:**
- Seat preferences (window, aisle, middle, exit row)
- Meal preferences (vegetarian, vegan, halal, kosher, gluten-free)
- Special assistance needs
- Priority services preferences
- Preferred airlines and airports
- Travel class preference

**Fields:**
- `seatPreference`: Preferred seat type enum
- `mealPreference`: Meal preference enum
- `prefersWindowSeat` / `prefersAisleSeat` / `prefersExitRow`: Seat type flags
- `needsSpecialAssistance`: Special assistance flag
- `specialAssistanceDetails`: Details of special needs
- `prefersPriorityBoarding`: Priority boarding preference
- `prefersLoungeAccess`: Lounge access preference
- `preferredAirline`: Preferred airline
- `preferredAirports`: Comma-separated preferred airports
- `travelClassPreference`: Preferred travel class

**Relationships:**
- Many-to-One with User

### 5. Loyalty Membership Entity

Frequent flyer program memberships.

**Key Features:**
- Multiple loyalty program support
- Tier levels (Bronze, Silver, Gold, Platinum)
- Miles and points tracking
- Tier expiry and requirements
- Benefits tracking

**Fields:**
- `programName`: Loyalty program name (e.g., "SkyMiles", "AAdvantage")
- `membershipNumber`: Frequent flyer number
- `tier`: Tier level enum (bronze, silver, gold, platinum)
- `miles`: Total miles accumulated
- `points`: Total points accumulated
- `tierExpiryDate`: Tier expiration date
- `tierMilesRequired`: Miles needed for next tier
- `isActive`: Active membership flag
- `benefits`: JSON string of benefits

**Relationships:**
- Many-to-One with User

## User Roles

### Role Hierarchy

1. **Customer/Guest**: Regular passenger (default)
2. **Registered User**: Account holder with benefits
3. **Admin**: System administrator
4. **Airline Staff**: Check-in, gate agents
5. **Travel Agent**: Third-party booking agent

## User Status Workflow

```
PENDING_VERIFICATION → ACTIVE
                          ↓
                      INACTIVE
                          ↓
                      SUSPENDED
```

### Status Transitions

- **PENDING_VERIFICATION**: New user, email not verified
- **ACTIVE**: Verified and active user
- **INACTIVE**: User account deactivated
- **SUSPENDED**: User account suspended (temporary or permanent)

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /users/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** User object with profile (password excluded)

#### Login
```
POST /users/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "session_token_here"
}
```

### User Management Endpoints

#### Create User (Admin)
```
POST /users
```

#### Get All Users
```
GET /users
```

#### Search Users
```
GET /users/search?email=john@example.com&role=registered_user&status=active&page=1&limit=10
```

#### Get User by ID
```
GET /users/:id
```

#### Get User by Email
```
GET /users/email/:email
```

#### Update User
```
PATCH /users/:id
```

#### Update User Status
```
PATCH /users/:id/status
```

#### Verify Email
```
POST /users/:id/verify-email
```

#### Delete User
```
DELETE /users/:id
```

### User Profile Endpoints

#### Update Profile
```
PATCH /users/:id/profile
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "passportNumber": "AA1234567",
  "passportExpiryDate": "2030-01-01"
}
```

### Payment Methods Endpoints

#### Add Payment Method
```
POST /users/:id/payment-methods
```

**Request Body:**
```json
{
  "type": "credit_card",
  "cardHolderName": "John Doe",
  "lastFourDigits": "1234",
  "cardBrand": "Visa",
  "expiryDate": "2025-12-31",
  "isDefault": true,
  "billingAddress": "123 Main St, New York, NY 10001"
}
```

#### Get Payment Methods
```
GET /users/:id/payment-methods
```

#### Remove Payment Method
```
DELETE /users/:id/payment-methods/:paymentMethodId
```

### Travel Preferences Endpoints

#### Update Travel Preferences
```
PATCH /users/:id/travel-preferences
```

**Request Body:**
```json
{
  "seatPreference": "window",
  "mealPreference": "vegetarian",
  "prefersWindowSeat": true,
  "prefersPriorityBoarding": true,
  "preferredAirline": "Airline Name",
  "travelClassPreference": "Business"
}
```

#### Get Travel Preferences
```
GET /users/:id/travel-preferences
```

### Loyalty Memberships Endpoints

#### Add Loyalty Membership
```
POST /users/:id/loyalty-memberships
```

**Request Body:**
```json
{
  "programName": "SkyMiles",
  "membershipNumber": "DL123456789",
  "tier": "gold",
  "miles": 50000,
  "points": 25000,
  "isActive": true
}
```

#### Get Loyalty Memberships
```
GET /users/:id/loyalty-memberships
```

#### Remove Loyalty Membership
```
DELETE /users/:id/loyalty-memberships/:membershipId
```

### User Bookings Endpoint

#### Get User Bookings
```
GET /users/:id/bookings
```

Returns all bookings associated with the user.

## Service Methods

### Authentication Methods

- `register(registerDto: RegisterDto)`: Register a new user
- `login(loginDto: LoginDto)`: Authenticate user and generate session token

### User CRUD Methods

- `create(createUserDto: CreateUserDto)`: Create user (admin)
- `findAll()`: Get all users
- `findOne(id: string)`: Get user by ID
- `findByEmail(email: string)`: Get user by email
- `search(searchUsersDto: SearchUsersDto)`: Search users with filters
- `update(id: string, updateUserDto: UpdateUserDto)`: Update user
- `remove(id: string)`: Delete user
- `verifyEmail(userId: string)`: Verify user email
- `updateStatus(userId: string, status: UserStatus)`: Update user status

### Profile Methods

- `updateProfile(userId: string, createUserProfileDto: CreateUserProfileDto)`: Update user profile

### Payment Method Methods

- `addPaymentMethod(userId: string, createPaymentMethodDto: CreatePaymentMethodDto)`: Add payment method
- `getPaymentMethods(userId: string)`: Get user payment methods
- `removePaymentMethod(userId: string, paymentMethodId: string)`: Remove payment method

### Travel Preference Methods

- `updateTravelPreferences(userId: string, createTravelPreferenceDto: CreateTravelPreferenceDto)`: Update travel preferences
- `getTravelPreferences(userId: string)`: Get travel preferences

### Loyalty Membership Methods

- `addLoyaltyMembership(userId: string, createLoyaltyMembershipDto: CreateLoyaltyMembershipDto)`: Add loyalty membership
- `getLoyaltyMemberships(userId: string)`: Get user loyalty memberships
- `removeLoyaltyMembership(userId: string, membershipId: string)`: Remove loyalty membership

### Booking Methods

- `getUserBookings(userId: string)`: Get user's booking history

## Security Considerations

### Password Hashing

Currently using SHA-256 for password hashing. **Recommendation**: Upgrade to bcrypt for production use:

```typescript
import * as bcrypt from 'bcrypt';

private async hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}
```

### Session Management

- Session tokens are generated using crypto.randomBytes
- Sessions expire after 24 hours
- Session tokens are stored in the database

### Email Verification

- New users start with `PENDING_VERIFICATION` status
- Email verification required to activate account
- Status changes to `ACTIVE` after verification

### Two-Factor Authentication

- 2FA support is implemented but requires additional setup
- `twoFactorSecret` field stores the secret key
- Integration with authenticator apps needed

## Integration with Booking Module

The User module is integrated with the Booking module:

- **Booking Entity** has optional `userId` field (supports guest bookings)
- **User Entity** has `OneToMany` relationship with `Booking`
- Users can view their booking history via `GET /users/:id/bookings`
- Bookings can be filtered by user via `GET /bookings/search?userId=...`

## Example Usage

### Complete User Registration Flow

1. **Register User**
```bash
POST /users/register
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

2. **Login**
```bash
POST /users/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

3. **Update Profile**
```bash
PATCH /users/:id/profile
{
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "passportNumber": "AA1234567"
}
```

4. **Add Payment Method**
```bash
POST /users/:id/payment-methods
{
  "type": "credit_card",
  "cardHolderName": "John Doe",
  "lastFourDigits": "1234",
  "isDefault": true
}
```

5. **Set Travel Preferences**
```bash
PATCH /users/:id/travel-preferences
{
  "seatPreference": "window",
  "mealPreference": "vegetarian",
  "prefersPriorityBoarding": true
}
```

6. **Add Loyalty Membership**
```bash
POST /users/:id/loyalty-memberships
{
  "programName": "SkyMiles",
  "membershipNumber": "DL123456789",
  "tier": "gold"
}
```

7. **View Bookings**
```bash
GET /users/:id/bookings
```

## Database Indexes

The following indexes are created for performance:

- `users.email` (unique)
- `users.username` (unique, where username IS NOT NULL)
- `payment_methods.userId, isDefault`
- `loyalty_memberships.userId, programName` (unique)
- `bookings.userId, bookingDate`

## Future Enhancements

1. **Password Reset**: Implement password reset via email
2. **Email Verification**: Send verification emails
3. **Two-Factor Authentication**: Complete 2FA implementation
4. **OAuth Integration**: Social login (Google, Facebook, etc.)
5. **Role-Based Access Control**: Implement guards and decorators
6. **Audit Logging**: Track user actions
7. **Password Policy**: Enforce password complexity rules
8. **Account Lockout**: Lock accounts after failed login attempts

