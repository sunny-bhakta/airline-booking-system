# Postman Collection for Airline Booking System

## Import Instructions

1. **Open Postman**
2. Click **Import** button (top left)
3. Select the file: `Airline-Booking-System.postman_collection.json`
4. The collection will be imported with all endpoints

## Environment Variables

Before testing, set up environment variables in Postman:

1. Create a new environment or use the default
2. Add these variables:
   - `baseUrl`: `http://localhost:3000`
   - `flightId`: (will be auto-set after creating a flight)
   - `routeId`: UUID of an existing route
   - `scheduleId`: UUID of an existing schedule
   - `aircraftId`: UUID of an existing aircraft

## Available Endpoints

### App
- **GET /** - Get welcome message

### Flights
- **POST /flights** - Create a new flight
- **GET /flights** - Get all flights
- **GET /flights/search** - Search flights (with query parameters)
- **GET /flights/:id** - Get flight by ID
- **GET /flights/status/:status** - Get flights by status
- **GET /flights/date/:date** - Get flights by date
- **PATCH /flights/:id** - Update flight
- **PATCH /flights/:id/status** - Update flight status
- **DELETE /flights/:id** - Delete flight

## Testing Workflow

1. **Start the server**: `npm run start:dev`
2. **Set up test data**: You'll need to create airports, routes, schedules, and aircraft first (these endpoints can be added later)
3. **Test Create Flight**: Use the "Create Flight" request (it will auto-save the flightId)
4. **Test other endpoints**: Use the saved flightId for GET, UPDATE, DELETE operations

## Alternative Testing Tools

### 1. Swagger UI (Recommended)
- Start the server: `npm run start:dev`
- Open browser: `http://localhost:3000/api`
- Interactive API documentation with "Try it out" feature

### 2. Thunder Client (VS Code Extension)
- Install Thunder Client extension in VS Code
- Import the Postman collection
- Test directly from VS Code

### 3. REST Client (VS Code Extension)
- Install REST Client extension
- Use `.http` files for testing (see `api-tests.http`)

### 4. cURL Commands
- Use command line with cURL
- See `curl-examples.sh` for examples

### 5. Insomnia
- Import the Postman collection
- Similar interface to Postman

