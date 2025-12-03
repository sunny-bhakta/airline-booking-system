import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AncillaryService } from './ancillary.service';
import {
  CreateBaggageDto,
  CreateInFlightServiceDto,
  CreateTravelInsuranceDto,
  UpdateBaggageDto,
  UpdateInFlightServiceDto,
  UpdateTravelInsuranceDto,
} from './dto';

@ApiTags('ancillary')
@Controller('ancillary')
export class AncillaryController {
  constructor(private readonly ancillaryService: AncillaryService) {}

  // ========== Baggage Endpoints ==========

  @Post('baggage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add baggage to a booking' })
  @ApiResponse({ status: 201, description: 'Baggage added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking or passenger not found' })
  @ApiBody({ type: CreateBaggageDto })
  addBaggage(@Body() createBaggageDto: CreateBaggageDto) {
    return this.ancillaryService.addBaggage(createBaggageDto);
  }

  @Get('baggage/booking/:bookingId')
  @ApiOperation({ summary: 'Get all baggage for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'List of baggage items' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getBaggageByBooking(@Param('bookingId') bookingId: string) {
    return this.ancillaryService.getBaggageByBooking(bookingId);
  }

  @Get('baggage/:id')
  @ApiOperation({ summary: 'Get baggage by ID' })
  @ApiParam({ name: 'id', description: 'Baggage UUID' })
  @ApiResponse({ status: 200, description: 'Baggage details' })
  @ApiResponse({ status: 404, description: 'Baggage not found' })
  getBaggageById(@Param('id') id: string) {
    return this.ancillaryService.getBaggageById(id);
  }

  @Patch('baggage/:id')
  @ApiOperation({ summary: 'Update baggage' })
  @ApiParam({ name: 'id', description: 'Baggage UUID' })
  @ApiResponse({ status: 200, description: 'Baggage updated successfully' })
  @ApiResponse({ status: 404, description: 'Baggage not found' })
  @ApiBody({ type: UpdateBaggageDto })
  updateBaggage(
    @Param('id') id: string,
    @Body() updateBaggageDto: UpdateBaggageDto,
  ) {
    return this.ancillaryService.updateBaggage(id, updateBaggageDto);
  }

  @Delete('baggage/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove baggage' })
  @ApiParam({ name: 'id', description: 'Baggage UUID' })
  @ApiResponse({ status: 204, description: 'Baggage removed successfully' })
  @ApiResponse({ status: 404, description: 'Baggage not found' })
  removeBaggage(@Param('id') id: string) {
    return this.ancillaryService.removeBaggage(id);
  }

  // ========== In-Flight Services Endpoints ==========

  @Post('in-flight-services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add in-flight service to a booking' })
  @ApiResponse({ status: 201, description: 'Service added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking or passenger not found' })
  @ApiBody({ type: CreateInFlightServiceDto })
  addInFlightService(@Body() createInFlightServiceDto: CreateInFlightServiceDto) {
    return this.ancillaryService.addInFlightService(createInFlightServiceDto);
  }

  @Get('in-flight-services/booking/:bookingId')
  @ApiOperation({ summary: 'Get all in-flight services for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'List of in-flight services' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getInFlightServicesByBooking(@Param('bookingId') bookingId: string) {
    return this.ancillaryService.getInFlightServicesByBooking(bookingId);
  }

  @Get('in-flight-services/:id')
  @ApiOperation({ summary: 'Get in-flight service by ID' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 200, description: 'Service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  getInFlightServiceById(@Param('id') id: string) {
    return this.ancillaryService.getInFlightServiceById(id);
  }

  @Patch('in-flight-services/:id')
  @ApiOperation({ summary: 'Update in-flight service' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @ApiBody({ type: UpdateInFlightServiceDto })
  updateInFlightService(
    @Param('id') id: string,
    @Body() updateInFlightServiceDto: UpdateInFlightServiceDto,
  ) {
    return this.ancillaryService.updateInFlightService(id, updateInFlightServiceDto);
  }

  @Delete('in-flight-services/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove in-flight service' })
  @ApiParam({ name: 'id', description: 'Service UUID' })
  @ApiResponse({ status: 204, description: 'Service removed successfully' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  removeInFlightService(@Param('id') id: string) {
    return this.ancillaryService.removeInFlightService(id);
  }

  // ========== Travel Insurance Endpoints ==========

  @Post('travel-insurance')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add travel insurance to a booking' })
  @ApiResponse({ status: 201, description: 'Insurance added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Booking or passenger not found' })
  @ApiBody({ type: CreateTravelInsuranceDto })
  addTravelInsurance(@Body() createTravelInsuranceDto: CreateTravelInsuranceDto) {
    return this.ancillaryService.addTravelInsurance(createTravelInsuranceDto);
  }

  @Get('travel-insurance/booking/:bookingId')
  @ApiOperation({ summary: 'Get all travel insurance for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'List of travel insurance policies' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getTravelInsuranceByBooking(@Param('bookingId') bookingId: string) {
    return this.ancillaryService.getTravelInsuranceByBooking(bookingId);
  }

  @Get('travel-insurance/:id')
  @ApiOperation({ summary: 'Get travel insurance by ID' })
  @ApiParam({ name: 'id', description: 'Insurance UUID' })
  @ApiResponse({ status: 200, description: 'Insurance details' })
  @ApiResponse({ status: 404, description: 'Insurance not found' })
  getTravelInsuranceById(@Param('id') id: string) {
    return this.ancillaryService.getTravelInsuranceById(id);
  }

  @Patch('travel-insurance/:id')
  @ApiOperation({ summary: 'Update travel insurance' })
  @ApiParam({ name: 'id', description: 'Insurance UUID' })
  @ApiResponse({ status: 200, description: 'Insurance updated successfully' })
  @ApiResponse({ status: 404, description: 'Insurance not found' })
  @ApiBody({ type: UpdateTravelInsuranceDto })
  updateTravelInsurance(
    @Param('id') id: string,
    @Body() updateTravelInsuranceDto: UpdateTravelInsuranceDto,
  ) {
    return this.ancillaryService.updateTravelInsurance(id, updateTravelInsuranceDto);
  }

  @Delete('travel-insurance/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove travel insurance' })
  @ApiParam({ name: 'id', description: 'Insurance UUID' })
  @ApiResponse({ status: 204, description: 'Insurance removed successfully' })
  @ApiResponse({ status: 404, description: 'Insurance not found' })
  removeTravelInsurance(@Param('id') id: string) {
    return this.ancillaryService.removeTravelInsurance(id);
  }

  // ========== Aggregate Endpoints ==========

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get all ancillary services for a booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({
    status: 200,
    description: 'All ancillary services with totals',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  getAllAncillaryServicesByBooking(@Param('bookingId') bookingId: string) {
    return this.ancillaryService.getAllAncillaryServicesByBooking(bookingId);
  }
}

