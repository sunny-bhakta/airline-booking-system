# Database Seeding Guide

This guide explains how to seed your database with test data for the Airline Booking System.

## 🚀 Quick Start

### Seed All Data
```bash
npm run seed
```

This command will create:
- **5 Airports** (JFK, LAX, ORD, DFW, MIA)
- **3 Seat Configurations** (Boeing 737-800, Airbus A320, Boeing 777-300ER)
- **4 Aircraft** (with different models)
- **5 Routes** (between major airports)
- **4 Schedules** (different departure/arrival times)
- **~60 Flights** (for the next 30 days)

### Clear All Data
```bash
npm run seed:clear
```

This command will delete all data from:
- Flights
- Routes
- Schedules
- Aircraft
- Seat Configurations
- Airports

## 📋 What Gets Created

### Airports
- **JFK** - John F. Kennedy International Airport (New York)
- **LAX** - Los Angeles International Airport
- **ORD** - O'Hare International Airport (Chicago)
- **DFW** - Dallas/Fort Worth International Airport
- **MIA** - Miami International Airport

### Seat Configurations
1. **Boeing 737-800 Standard** (180 seats)
   - First Class: 8 seats (rows 1-2)
   - Business: 36 seats (rows 3-8)
   - Economy: 136 seats (rows 9-30)

2. **Airbus A320 Standard** (168 seats)
   - Business: 24 seats (rows 1-4)
   - Economy: 144 seats (rows 5-28)

3. **Boeing 777-300ER Wide Body** (396 seats)
   - First Class: 12 seats (rows 1-3)
   - Business: 54 seats (rows 4-12)
   - Premium Economy: 48 seats (rows 13-18)
   - Economy: 282 seats (rows 19-42)

### Aircraft
- N123AA - Boeing 737-800 (2018)
- N456BB - Boeing 737-800 (2019)
- N789CC - Airbus A320 (2020)
- N321DD - Boeing 777-300ER (2017)

### Routes
- JFK ↔ LAX (3,944 km, 6 hours)
- JFK → ORD (1,186 km, 2.5 hours)
- ORD → DFW (1,291 km, 2.75 hours)
- JFK → MIA (1,769 km, 3 hours)

### Schedules
- Morning: 08:00 - 14:00 (Mon-Fri)
- Midday: 10:30 - 16:30 (Daily)
- Afternoon: 14:15 - 16:45 (Mon-Fri)
- Evening: 18:00 - 21:00 (Daily)

### Flights
- **AA100**: JFK → LAX (daily for 30 days)
- **AA101**: LAX → JFK (daily for 30 days)
- **AA200**: JFK → ORD (every other day for 30 days)

## 🔧 Usage Examples

### Seed Database
```bash
npm run seed
```

**Output:**
```
🌱 Starting database seeding...

📍 Seeding airports...
   ✓ Created airport: JFK - John F. Kennedy International Airport
   ✓ Created airport: LAX - Los Angeles International Airport
   ...

💺 Seeding seat configurations...
   ✓ Created seat config: Boeing 737-800 Standard (180 seats)
   ...

✈️  Seeding aircraft...
   ✓ Created aircraft: N123AA - Boeing 737-800
   ...

🛣️  Seeding routes...
   ✓ Created route: JFK → LAX
   ...

⏰ Seeding schedules...
   ✓ Created schedule: 08:00:00 - 14:00:00
   ...

🛫 Seeding flights...
   ✓ Created 60 flights for the next 30 days

✅ Database seeding completed!
   - 5 Airports
   - 3 Seat Configurations
   - 4 Aircraft
   - 5 Routes
   - 4 Schedules
   - 60 Flights
```

### Clear Database
```bash
npm run seed:clear
```

**Output:**
```
🗑️  Clearing all data...
✅ All data cleared!
```

## 📝 Notes

- **Idempotent**: Running `npm run seed` multiple times won't create duplicates. It checks for existing records.
- **Safe**: Existing data won't be overwritten unless you clear first.
- **Order Matters**: Data is seeded in the correct order (airports → seat configs → aircraft → routes → schedules → flights).

## 🧪 Testing After Seeding

After seeding, you can test the API:

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Test endpoints:**
   - `GET http://localhost:3000/flights` - See all flights
   - `GET http://localhost:3000/flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25` - Search flights
   - `GET http://localhost:3000/flights/status/scheduled` - Get scheduled flights

3. **Use Swagger UI:**
   - Open: `http://localhost:3000/api`
   - Test all endpoints interactively

## 🔄 Workflow

### Development Workflow
1. Clear old data: `npm run seed:clear`
2. Seed fresh data: `npm run seed`
3. Test your changes
4. Repeat as needed

### Production
- **Never run seeders in production!**
- Use migrations for production database changes
- Seeders are for development/testing only

## 🛠️ Customization

To customize the seed data, edit:
- `src/database/seeders/seeder.service.ts`

You can modify:
- Airport data
- Seat configurations
- Aircraft models
- Routes
- Schedules
- Flight frequency and dates

## 📚 Related Files

- **Seeder Service**: `src/database/seeders/seeder.service.ts`
- **Seed Module**: `src/database/seeders/seed.module.ts`
- **Seed Script**: `src/database/seed.ts`
- **Package Scripts**: `package.json`

## ⚠️ Troubleshooting

**Issue**: "Cannot find module"
- **Solution**: Run `npm install` first

**Issue**: "Database locked"
- **Solution**: Make sure the server is not running, or stop it first

**Issue**: "Entity not found"
- **Solution**: Make sure all entities are properly imported in `app.module.ts`

**Issue**: "Duplicate entry"
- **Solution**: The seeder is idempotent, but if you see this, clear first: `npm run seed:clear`

