1. Airports (7 Indian airports)
DEL - Indira Gandhi International Airport (New Delhi)
BOM - Chhatrapati Shivaji Maharaj International Airport (Mumbai)
BLR - Kempegowda International Airport (Bangalore)
CCU - Netaji Subhash Chandra Bose International Airport (Kolkata)
MAA - Chennai International Airport (Chennai)
HYD - Rajiv Gandhi International Airport (Hyderabad) — NEW
GOI - Dabolim Airport (Goa) — NEW
2. Terminals
Created terminals for each airport (1–3 terminals per airport)
Delhi has 3 terminals (T1, T2, T3)
Other airports have 1–2 terminals each
3. Gates
Created 8–12 gates per terminal
Gate naming: A1, A2, A3, B1, B2, B3, etc.
Total: ~100+ gates across all terminals
4. Aircraft (Indian registration)
Changed from US (N-XXX) to Indian (VT-XXX) format:
VT-AAA, VT-AAB, VT-AAC, VT-AAD, VT-AAE, VT-AAF
5. Routes (Indian domestic routes)
DEL ↔ BOM (Delhi ↔ Mumbai)
DEL ↔ BLR (Delhi ↔ Bangalore)
BOM ↔ BLR (Mumbai ↔ Bangalore)
DEL ↔ CCU (Delhi ↔ Kolkata)
DEL ↔ MAA (Delhi ↔ Chennai)
BOM ↔ MAA (Mumbai ↔ Chennai)
BLR ↔ HYD (Bangalore ↔ Hyderabad)
BOM ↔ GOI (Mumbai ↔ Goa)
6. Flights (Indian airlines)
Air India (AI): AI101, AI102, AI201, AI202
IndiGo (6E): 6E301, 6E302, 6E401, 6E402, 6E501, 6E502
Flights for the next 30 days
Gates assigned from origin airports
Various schedules (morning, midday, afternoon, evening)
7. Updated clearAll
Now includes terminals and gates deletion
To run the seeder:
npm run seed seed
This will create:
7 Indian airports
~13 terminals
~100+ gates
3 seat configurations
6 aircraft (Indian registration)
16 routes (bidirectional)
4 schedules
~200+ flights for the next 30 days