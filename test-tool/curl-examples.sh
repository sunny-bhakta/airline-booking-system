#!/bin/bash

# Airline Booking System API - cURL Examples
# Base URL
BASE_URL="http://localhost:3000"

echo "=== Airline Booking System API Tests ==="
echo ""

# Get Welcome Message
echo "1. Get Welcome Message"
curl -X GET "${BASE_URL}/" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Get All Flights
echo "2. Get All Flights"
curl -X GET "${BASE_URL}/flights" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Search Flights
echo "3. Search Flights"
curl -X GET "${BASE_URL}/flights/search?origin=JFK&destination=LAX&departureDate=2024-12-25&passengers=2&page=1&limit=10" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Get Flights by Status
echo "4. Get Flights by Status (scheduled)"
curl -X GET "${BASE_URL}/flights/status/scheduled" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Get Flights by Date
echo "5. Get Flights by Date"
curl -X GET "${BASE_URL}/flights/date/2024-12-25" \
  -H "Content-Type: application/json"
echo -e "\n\n"

# Create Flight (Replace UUIDs with actual values)
echo "6. Create Flight"
FLIGHT_DATA='{
  "flightNumber": "AA123",
  "routeId": "YOUR_ROUTE_UUID_HERE",
  "scheduleId": "YOUR_SCHEDULE_UUID_HERE",
  "aircraftId": "YOUR_AIRCRAFT_UUID_HERE",
  "departureDate": "2024-12-25",
  "gate": "A12",
  "terminal": "1",
  "status": "scheduled"
}'

curl -X POST "${BASE_URL}/flights" \
  -H "Content-Type: application/json" \
  -d "${FLIGHT_DATA}"
echo -e "\n\n"

# Update Flight (Replace FLIGHT_ID with actual UUID)
echo "7. Update Flight"
FLIGHT_ID="YOUR_FLIGHT_UUID_HERE"
UPDATE_DATA='{
  "gate": "B15",
  "terminal": "2",
  "status": "boarding"
}'

curl -X PATCH "${BASE_URL}/flights/${FLIGHT_ID}" \
  -H "Content-Type: application/json" \
  -d "${UPDATE_DATA}"
echo -e "\n\n"

# Update Flight Status
echo "8. Update Flight Status"
STATUS_DATA='{
  "status": "delayed"
}'

curl -X PATCH "${BASE_URL}/flights/${FLIGHT_ID}/status" \
  -H "Content-Type: application/json" \
  -d "${STATUS_DATA}"
echo -e "\n\n"

# Delete Flight
echo "9. Delete Flight"
curl -X DELETE "${BASE_URL}/flights/${FLIGHT_ID}" \
  -H "Content-Type: application/json"
echo -e "\n\n"

echo "=== Tests Complete ==="

