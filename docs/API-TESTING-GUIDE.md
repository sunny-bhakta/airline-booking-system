# API Testing Guide

This guide covers multiple ways to test the Airline Booking System Flight Management API.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Access Swagger UI:**
   - Open browser: `http://localhost:3000/api`
   - Interactive API documentation with "Try it out" feature

## 📋 Testing Options

### Option 1: Swagger UI (Recommended - Easiest)

**Why use it:**
- ✅ Built-in interactive documentation
- ✅ No setup required
- ✅ See request/response schemas
- ✅ Test directly in browser

**Steps:**
1. Start server: `npm run start:dev`
2. Open: `http://localhost:3000/api`
3. Click on any endpoint
4. Click "Try it out"
5. Fill in parameters
6. Click "Execute"

**Screenshot locations:**
- All endpoints are documented
- Request/response examples included
- Schema validation visible

---

### Option 2: Postman Collection

**Why use it:**
- ✅ Professional API testing
- ✅ Save requests and responses
- ✅ Environment variables
- ✅ Test automation
- ✅ Team collaboration

**Setup:**
1. Open Postman
2. Click **Import**
3. Select: `postman/Airline-Booking-System.postman_collection.json`
4. Set environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `routeId`, `scheduleId`, `aircraftId`: (UUIDs from your database)

**Features:**
- Pre-configured requests
- Auto-save flightId after creation
- Environment variables for easy testing
- All endpoints included

---

### Option 3: REST Client (VS Code Extension)

**Why use it:**
- ✅ Test from VS Code
- ✅ No external tools needed
- ✅ Simple HTTP file format

**Setup:**
1. Install "REST Client" extension in VS Code
2. Open `api-tests.http`
3. Click "Send Request" above each request

**File:** `api-tests.http`
- All endpoints with examples
- Variables for easy customization
- Comments for guidance

---

### Option 4: cURL Commands

**Why use it:**
- ✅ Command-line testing
- ✅ Scriptable
- ✅ CI/CD integration

**Usage:**
```bash
# Make executable (Linux/Mac)
chmod +x curl-examples.sh

# Run all examples
./curl-examples.sh

# Or run individual commands
curl -X GET "http://localhost:3000/flights"
```

**File:** `curl-examples.sh`
- All endpoints as cURL commands
- Replace UUIDs with actual values
- Easy to modify

---

### Option 5: Thunder Client (VS Code Extension)

**Why use it:**
- ✅ Postman-like interface in VS Code
- ✅ Import Postman collections
- ✅ No separate app needed

**Setup:**
1. Install "Thunder Client" extension
2. Import Postman collection
3. Start testing

---

### Option 6: Insomnia

**Why use it:**
- ✅ Clean, modern interface
- ✅ Import Postman collections
- ✅ Great for API design

**Setup:**
1. Download Insomnia
2. Import: `postman/Airline-Booking-System.postman_collection.json`
3. Set environment variables

---

## 📝 Available Endpoints

### App Endpoints
- `GET /` - Welcome message

### Flight Endpoints
- `POST /flights` - Create flight
- `GET /flights` - Get all flights
- `GET /flights/search` - Search flights
- `GET /flights/:id` - Get flight by ID
- `GET /flights/status/:status` - Get flights by status
- `GET /flights/date/:date` - Get flights by date
- `PATCH /flights/:id` - Update flight
- `PATCH /flights/:id/status` - Update flight status
- `DELETE /flights/:id` - Delete flight

## 🔧 Prerequisites for Testing

Before testing flight creation, you need:

1. **Airport** records (with IATA codes like JFK, LAX)
2. **Route** (linking origin and destination airports)
3. **Schedule** (departure/arrival times)
4. **Aircraft** (with seat configuration)

**Note:** These endpoints can be added later. For now, you can:
- Test GET endpoints (they'll return empty if no data)
- Use Swagger to see the API structure
- Manually insert test data into the database

## 📊 Example Test Data

### Search Flights Example
```
GET /flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2
```

### Create Flight Example
```json
{
  "flightNumber": "AA123",
  "routeId": "uuid-here",
  "scheduleId": "uuid-here",
  "aircraftId": "uuid-here",
  "departureDate": "2024-12-25",
  "gate": "A12",
  "terminal": "1"
}
```

### Update Flight Status Example
```json
{
  "status": "delayed"
}
```

## 🎯 Recommended Testing Flow

1. **Start with Swagger UI** - Understand the API structure
2. **Use Postman** - For detailed testing and automation
3. **Use REST Client** - For quick tests during development
4. **Use cURL** - For scripts and CI/CD

## 📚 Additional Resources

- **Swagger Docs:** `http://localhost:3000/api`
- **Postman Collection:** `postman/Airline-Booking-System.postman_collection.json`
- **REST Client File:** `api-tests.http`
- **cURL Script:** `curl-examples.sh`

## 💡 Tips

1. **Environment Variables:** Use Postman/Thunder Client environments for different configs (dev, staging, prod)
2. **Save Responses:** Save successful responses as examples
3. **Test Error Cases:** Try invalid data to test validation
4. **Check Logs:** Server logs show detailed error messages
5. **Database:** Use SQLite browser to inspect `travel.db` directly

## 🐛 Troubleshooting

**Issue:** "Route not found" when creating flight
- **Solution:** Create route, schedule, and aircraft first

**Issue:** Port 3000 already in use
- **Solution:** Change port in `src/main.ts` or kill the process using port 3000

**Issue:** CORS errors
- **Solution:** CORS is enabled, check if server is running

**Issue:** Validation errors
- **Solution:** Check Swagger docs for required fields and formats

