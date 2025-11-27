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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateSeatAssignmentDto } from './dto/create-seat-assignment.dto';
import { SearchBookingsDto } from './dto/search-bookings.dto';
import { BookingStatus } from './entities/booking.entity';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Flight not found' })
  @ApiBody({ type: CreateBookingDto })
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'List of all bookings' })
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search bookings with filters' })
  @ApiResponse({ status: 200, description: 'Search results with pagination' })
  @ApiQuery({ name: 'pnr', required: false, description: 'PNR code' })
  @ApiQuery({ name: 'flightId', required: false, description: 'Flight UUID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookingStatus,
    description: 'Booking status',
  })
  @ApiQuery({
    name: 'bookingDateFrom',
    required: false,
    description: 'Booking date from (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'bookingDateTo',
    required: false,
    description: 'Booking date to (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  search(@Query() searchBookingsDto: SearchBookingsDto) {
    return this.bookingsService.search(searchBookingsDto);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get bookings by status' })
  @ApiParam({ name: 'status', enum: BookingStatus, description: 'Booking status' })
  @ApiResponse({
    status: 200,
    description: 'List of bookings with the specified status',
  })
  findByStatus(@Param('status') status: BookingStatus) {
    return this.bookingsService.getBookingsByStatus(status);
  }

  @Get('pnr/:pnr')
  @ApiOperation({ summary: 'Get booking by PNR' })
  @ApiParam({ name: 'pnr', description: 'PNR code (e.g., ABC123)' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findByPNR(@Param('pnr') pnr: string) {
    return this.bookingsService.findByPNR(pnr);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBody({ type: UpdateBookingDto })
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(BookingStatus) },
        cancellationReason: { type: 'string' },
      },
    },
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
    @Body('cancellationReason') cancellationReason?: string,
  ) {
    return this.bookingsService.updateStatus(id, status, cancellationReason);
  }

  @Post(':id/tickets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate tickets for a booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 201, description: 'Tickets generated successfully' })
  @ApiResponse({ status: 400, description: 'Tickets already generated' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  generateTickets(@Param('id') id: string) {
    return this.bookingsService.generateTickets(id);
  }

  @Post(':id/seats')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Assign seat to a passenger' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 201, description: 'Seat assigned successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking or passenger not found' })
  @ApiBody({ type: CreateSeatAssignmentDto })
  assignSeat(
    @Param('id') id: string,
    @Body() createSeatAssignmentDto: CreateSeatAssignmentDto,
  ) {
    return this.bookingsService.assignSeat(id, createSeatAssignmentDto);
  }

  @Get(':id/seats')
  @ApiOperation({ summary: 'Get seat assignments for a booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'List of seat assignments' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getSeatAssignments(@Param('id') id: string) {
    return this.bookingsService.getSeatAssignments(id);
  }

  @Delete(':id/seats/:seatAssignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove seat assignment' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiParam({ name: 'seatAssignmentId', description: 'Seat assignment UUID' })
  @ApiResponse({ status: 204, description: 'Seat assignment removed' })
  @ApiResponse({ status: 404, description: 'Seat assignment not found' })
  removeSeatAssignment(
    @Param('id') id: string,
    @Param('seatAssignmentId') seatAssignmentId: string,
  ) {
    return this.bookingsService.removeSeatAssignment(id, seatAssignmentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete confirmed booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}

