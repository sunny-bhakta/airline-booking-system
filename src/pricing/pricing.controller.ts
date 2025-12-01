import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreateFareDto } from './dto/create-fare.dto';
import { UpdateFareDto } from './dto/update-fare.dto';
import { CreateFareRuleDto } from './dto/create-fare-rule.dto';
import { CreateTaxFeeDto } from './dto/create-tax-fee.dto';
import { CreatePromotionalCodeDto } from './dto/create-promotional-code.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { ValidatePromotionalCodeDto } from './dto/validate-promotional-code.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // Fare Management
  @Post('fares')
  @HttpCode(HttpStatus.CREATED)
  async createFare(@Body() createFareDto: CreateFareDto) {
    return await this.pricingService.createFare(createFareDto);
  }

  @Get('fares/flight/:flightId')
  async getFaresByFlight(@Param('flightId') flightId: string) {
    return await this.pricingService.getFaresByFlight(flightId);
  }

  @Get('fares/:id')
  async getFareById(@Param('id') id: string) {
    return await this.pricingService.getFareById(id);
  }

  @Put('fares/:id')
  async updateFare(
    @Param('id') id: string,
    @Body() updateFareDto: UpdateFareDto,
  ) {
    return await this.pricingService.updateFare(id, updateFareDto);
  }

  @Delete('fares/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFare(@Param('id') id: string) {
    await this.pricingService.deleteFare(id);
  }

  // Fare Rules
  @Post('fare-rules')
  @HttpCode(HttpStatus.CREATED)
  async createFareRule(@Body() createFareRuleDto: CreateFareRuleDto) {
    return await this.pricingService.createFareRule(createFareRuleDto);
  }

  @Get('fare-rules/:fareId')
  async getFareRules(@Param('fareId') fareId: string) {
    return await this.pricingService.getFareRules(fareId);
  }

  // Tax & Fees
  @Post('tax-fees')
  @HttpCode(HttpStatus.CREATED)
  async createTaxFee(@Body() createTaxFeeDto: CreateTaxFeeDto) {
    return await this.pricingService.createTaxFee(createTaxFeeDto);
  }

  @Get('tax-fees/:fareId')
  async getTaxFees(@Param('fareId') fareId: string) {
    return await this.pricingService.getTaxFees(fareId);
  }

  // Price Calculation
  @Post('calculate')
  async calculatePrice(@Body() calculatePriceDto: CalculatePriceDto) {
    return await this.pricingService.calculatePrice(calculatePriceDto);
  }

  // Promotional Codes
  @Post('promotional-codes')
  @HttpCode(HttpStatus.CREATED)
  async createPromotionalCode(
    @Body() createPromotionalCodeDto: CreatePromotionalCodeDto,
  ) {
    return await this.pricingService.createPromotionalCode(
      createPromotionalCodeDto,
    );
  }

  @Get('promotional-codes')
  async getPromotionalCodes(@Query('activeOnly') activeOnly?: string) {
    const activeOnlyBool = activeOnly === 'true';
    return await this.pricingService.getPromotionalCodes(activeOnlyBool);
  }

  @Get('promotional-codes/:code')
  async getPromotionalCodeByCode(@Param('code') code: string) {
    return await this.pricingService.getPromotionalCodeByCode(code);
  }

  @Post('promotional-codes/validate')
  async validatePromotionalCode(
    @Body() validateDto: ValidatePromotionalCodeDto,
  ) {
    return await this.pricingService.validatePromotionalCode(validateDto);
  }

  @Put('promotional-codes/:id')
  async updatePromotionalCode(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePromotionalCodeDto>,
  ) {
    return await this.pricingService.updatePromotionalCode(id, updateData);
  }

  @Delete('promotional-codes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePromotionalCode(@Param('id') id: string) {
    await this.pricingService.deletePromotionalCode(id);
  }
}

