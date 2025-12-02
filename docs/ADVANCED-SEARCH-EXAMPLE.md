# Advanced Search - Comprehensive Example URL

## Complete Feature Showcase URL

This single URL demonstrates **ALL** advanced search features in one request:

```
GET /flights/search/advanced?origin=DEL&destination=BOM&tripType=round-trip&departureDateFrom=2024-12-20&departureDateTo=2024-12-30&returnDateFrom=2024-12-27&returnDateTo=2025-01-05&passengers=2&minPrice=3000&maxPrice=15000&departureTimeFrom=06:00&departureTimeTo=18:00&arrivalTimeFrom=10:00&arrivalTimeTo=22:00&maxDuration=180&aircraftModel=737&aircraftManufacturer=Boeing&fareClass=Economy&stops=non-stop&includeNearbyAirports=true&nearbyAirportsRadius=100&sortBy=price&sortOrder=asc&page=1&limit=20
```

## URL Breakdown by Feature

### 1. Basic Search Parameters
- `origin=DEL` - Origin airport (Delhi)
- `destination=BOM` - Destination airport (Mumbai)

### 2. Trip Type
- `tripType=round-trip` - Round-trip search (options: `one-way`, `round-trip`, `multi-city`)

### 3. Flexible Dates (Outbound)
- `departureDateFrom=2024-12-20` - Start of departure date range
- `departureDateTo=2024-12-30` - End of departure date range

### 4. Flexible Dates (Return - for Round-Trip)
- `returnDateFrom=2024-12-27` - Start of return date range
- `returnDateTo=2025-01-05` - End of return date range

### 5. Passengers
- `passengers=2` - Number of passengers

### 6. Price Filters
- `minPrice=3000` - Minimum fare price (INR)
- `maxPrice=15000` - Maximum fare price (INR)

### 7. Time Filters (Departure)
- `departureTimeFrom=06:00` - Earliest departure time (24-hour format)
- `departureTimeTo=18:00` - Latest departure time (24-hour format)

### 8. Time Filters (Arrival)
- `arrivalTimeFrom=10:00` - Earliest arrival time (24-hour format)
- `arrivalTimeTo=22:00` - Latest arrival time (24-hour format)

### 9. Flight Duration Filter
- `maxDuration=180` - Maximum flight duration in minutes (3 hours)

### 10. Aircraft Filters
- `aircraftModel=737` - Filter by aircraft model (partial match, e.g., "737", "A320")
- `aircraftManufacturer=Boeing` - Filter by aircraft manufacturer (exact match)

### 11. Fare Class Filter
- `fareClass=Economy` - Filter by fare class (options: `Economy`, `Premium Economy`, `Business`, `First`)

### 12. Stops Filter
- `stops=non-stop` - Filter by number of stops (options: `non-stop`, `1-stop`, `2+ stops`, `any`)

### 13. Nearby Airports
- `includeNearbyAirports=true` - Include nearby airports in search
- `nearbyAirportsRadius=100` - Search radius in kilometers (default: 50)

### 14. Sorting
- `sortBy=price` - Sort field (options: `price`, `duration`, `departureTime`, `arrivalTime`)
- `sortOrder=asc` - Sort order (options: `asc`, `desc`)

### 15. Pagination
- `page=1` - Page number (default: 1)
- `limit=20` - Items per page (default: 10, max: 100)

## Simplified Examples

### Example 1: Basic One-Way with Price Filter
```
GET /flights/search/advanced?origin=DEL&destination=BOM&departureDate=2024-12-25&passengers=1&minPrice=5000&maxPrice=10000&sortBy=price
```

### Example 2: Flexible Dates with Time Window
```
GET /flights/search/advanced?origin=BLR&destination=COK&departureDateFrom=2024-12-20&departureDateTo=2024-12-30&departureTimeFrom=06:00&departureTimeTo=12:00&maxDuration=120
```

### Example 3: Round-Trip with Nearby Airports
```
GET /flights/search/advanced?origin=BOM&destination=DEL&tripType=round-trip&departureDate=2024-12-25&returnDate=2024-12-30&includeNearbyAirports=true&nearbyAirportsRadius=150
```

### Example 4: Business Class with Aircraft Filter
```
GET /flights/search/advanced?origin=DEL&destination=MAA&departureDateFrom=2024-12-20&departureDateTo=2024-12-30&fareClass=Business&aircraftManufacturer=Airbus&sortBy=duration&sortOrder=asc
```

### Example 5: Early Morning Flights Only
```
GET /flights/search/advanced?origin=HYD&destination=BLR&departureDateFrom=2024-12-20&departureDateTo=2024-12-30&departureTimeFrom=06:00&departureTimeTo=10:00&arrivalTimeFrom=08:00&arrivalTimeTo=12:00
```

## URL Encoding Notes

When using in actual HTTP requests, ensure proper URL encoding:
- Spaces should be encoded as `%20` or `+`
- Special characters should be URL-encoded
- Most HTTP clients handle this automatically

## Response Format

The response will include:
```json
{
  "flights": [...],
  "returnFlights": [...],  // For round-trip searches
  "total": 25,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

## Testing Tips

1. **Start Simple**: Begin with basic parameters and add filters incrementally
2. **Date Ranges**: Use flexible dates (`departureDateFrom`/`departureDateTo`) for better results
3. **Nearby Airports**: Enable `includeNearbyAirports=true` to find more options
4. **Price Sorting**: Use `sortBy=price&sortOrder=asc` to find cheapest flights
5. **Time Windows**: Combine departure and arrival time filters for specific travel times

## All Available Parameters Reference

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `origin` | string | Yes | Origin airport IATA code | `DEL` |
| `destination` | string | Yes | Destination airport IATA code | `BOM` |
| `tripType` | enum | No | Trip type | `one-way`, `round-trip`, `multi-city` |
| `departureDate` | date | No* | Specific departure date | `2024-12-25` |
| `departureDateFrom` | date | No* | Start of departure date range | `2024-12-20` |
| `departureDateTo` | date | No* | End of departure date range | `2024-12-30` |
| `returnDate` | date | No | Specific return date | `2024-12-30` |
| `returnDateFrom` | date | No | Start of return date range | `2024-12-27` |
| `returnDateTo` | date | No | End of return date range | `2025-01-05` |
| `passengers` | number | No | Number of passengers | `2` |
| `minPrice` | number | No | Minimum fare price | `3000` |
| `maxPrice` | number | No | Maximum fare price | `15000` |
| `departureTimeFrom` | time | No | Earliest departure time | `06:00` |
| `departureTimeTo` | time | No | Latest departure time | `18:00` |
| `arrivalTimeFrom` | time | No | Earliest arrival time | `10:00` |
| `arrivalTimeTo` | time | No | Latest arrival time | `22:00` |
| `stops` | enum | No | Stops filter | `non-stop`, `1-stop`, `2+ stops`, `any` |
| `maxDuration` | number | No | Max duration in minutes | `180` |
| `aircraftModel` | string | No | Aircraft model filter | `737` |
| `aircraftManufacturer` | string | No | Aircraft manufacturer | `Boeing` |
| `fareClass` | enum | No | Fare class filter | `Economy`, `Premium Economy`, `Business`, `First` |
| `status` | enum | No | Flight status | `scheduled`, `delayed`, etc. |
| `includeNearbyAirports` | boolean | No | Include nearby airports | `true`, `false` |
| `nearbyAirportsRadius` | number | No | Search radius in km | `100` |
| `page` | number | No | Page number | `1` |
| `limit` | number | No | Items per page | `20` |
| `sortBy` | string | No | Sort field | `price`, `duration`, `departureTime`, `arrivalTime` |
| `sortOrder` | string | No | Sort order | `asc`, `desc` |

*Either `departureDate` OR (`departureDateFrom` and `departureDateTo`) should be provided

