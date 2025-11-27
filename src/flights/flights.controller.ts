import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightStatus } from './entities/flight.entity';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new flight' })
  @ApiResponse({ status: 201, description: 'Flight created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Route, schedule, or aircraft not found' })
  @ApiBody({ type: CreateFlightDto })
  create(@Body() createFlightDto: CreateFlightDto) {
    return this.flightsService.create(createFlightDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flights' })
  @ApiResponse({ status: 200, description: 'List of all flights' })
  findAll() {
    return this.flightsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search flights by origin, destination, and date' })
  @ApiResponse({ status: 200, description: 'Search results with pagination' })
  @ApiQuery({ name: 'origin', description: 'Origin airport IATA code (e.g., JFK)' })
  @ApiQuery({ name: 'destination', description: 'Destination airport IATA code (e.g., LAX)' })
  @ApiQuery({ name: 'departureDate', description: 'Departure date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'returnDate', required: false, description: 'Return date for round-trip' })
  @ApiQuery({ name: 'passengers', required: false, description: 'Number of passengers', type: Number })
  @ApiQuery({ name: 'status', required: false, enum: FlightStatus, description: 'Filter by flight status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  search(@Query() searchFlightsDto: SearchFlightsDto) {
    return this.flightsService.search(searchFlightsDto);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get flights by status' })
  @ApiParam({ name: 'status', enum: FlightStatus, description: 'Flight status' })
  @ApiResponse({ status: 200, description: 'List of flights with the specified status' })
  findByStatus(@Param('status') status: FlightStatus) {
    return this.flightsService.getFlightsByStatus(status);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get flights by date' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
  @ApiResponse({ status: 200, description: 'List of flights on the specified date' })
  findByDate(@Param('date') date: string) {
    return this.flightsService.getFlightsByDate(new Date(date));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight by ID' })
  @ApiParam({ name: 'id', description: 'Flight UUID' })
  @ApiResponse({ status: 200, description: 'Flight details' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  findOne(@Param('id') id: string) {
    return this.flightsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update flight' })
  @ApiParam({ name: 'id', description: 'Flight UUID' })
  @ApiResponse({ status: 200, description: 'Flight updated successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @ApiBody({ type: UpdateFlightDto })
  update(@Param('id') id: string, @Body() updateFlightDto: UpdateFlightDto) {
    return this.flightsService.update(id, updateFlightDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update flight status' })
  @ApiParam({ name: 'id', description: 'Flight UUID' })
  @ApiResponse({ status: 200, description: 'Flight status updated successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(FlightStatus) } } } })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: FlightStatus,
  ) {
    return this.flightsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flight' })
  @ApiParam({ name: 'id', description: 'Flight UUID' })
  @ApiResponse({ status: 204, description: 'Flight deleted successfully' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete flight with existing bookings' })
  remove(@Param('id') id: string) {
    return this.flightsService.remove(id);
  }
}

