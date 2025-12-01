import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Fare, FareClass } from './entities/fare.entity';
import { FareRule } from './entities/fare-rule.entity';
import { TaxFee, TaxFeeCalculationType } from './entities/tax-fee.entity';
import { PromotionalCode, PromotionalCodeType, PromotionalCodeStatus } from './entities/promotional-code.entity';
import { CreateFareDto } from './dto/create-fare.dto';
import { CreateFareRuleDto } from './dto/create-fare-rule.dto';
import { CreateTaxFeeDto } from './dto/create-tax-fee.dto';
import { CreatePromotionalCodeDto } from './dto/create-promotional-code.dto';
import { CalculatePriceDto, PriceCalculationResult, TaxFeeBreakdown } from './dto/calculate-price.dto';
import { ValidatePromotionalCodeDto } from './dto/validate-promotional-code.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Fare)
    private fareRepository: Repository<Fare>,
    @InjectRepository(FareRule)
    private fareRuleRepository: Repository<FareRule>,
    @InjectRepository(TaxFee)
    private taxFeeRepository: Repository<TaxFee>,
    @InjectRepository(PromotionalCode)
    private promotionalCodeRepository: Repository<PromotionalCode>,
  ) {}

  /**
   * Create a new fare for a flight
   */
  async createFare(createFareDto: CreateFareDto): Promise<Fare> {
    const fare = this.fareRepository.create({
      ...createFareDto,
      dynamicPriceAdjustment: createFareDto.dynamicPriceAdjustment || 0,
      availableSeats: createFareDto.availableSeats || 0,
      currency: createFareDto.currency || 'USD',
      isActive: createFareDto.isActive !== undefined ? createFareDto.isActive : true,
    });

    return await this.fareRepository.save(fare);
  }

  /**
   * Get all fares for a flight
   */
  async getFaresByFlight(flightId: string): Promise<Fare[]> {
    return await this.fareRepository.find({
      where: { flightId, isActive: true },
      relations: ['fareRules', 'flight'],
      order: { fareClass: 'ASC' },
    });
  }

  /**
   * Get fare by ID
   */
  async getFareById(id: string): Promise<Fare> {
    const fare = await this.fareRepository.findOne({
      where: { id },
      relations: ['fareRules', 'taxFees', 'flight'],
    });

    if (!fare) {
      throw new NotFoundException(`Fare with ID ${id} not found`);
    }

    return fare;
  }

  /**
   * Update fare
   */
  async updateFare(id: string, updateData: Partial<CreateFareDto>): Promise<Fare> {
    const fare = await this.getFareById(id);
    Object.assign(fare, updateData);
    return await this.fareRepository.save(fare);
  }

  /**
   * Delete fare
   */
  async deleteFare(id: string): Promise<void> {
    const fare = await this.getFareById(id);
    await this.fareRepository.remove(fare);
  }

  /**
   * Create fare rule
   */
  async createFareRule(createFareRuleDto: CreateFareRuleDto): Promise<FareRule> {
    const fare = await this.getFareById(createFareRuleDto.fareId);
    
    const fareRule = this.fareRuleRepository.create(createFareRuleDto);
    return await this.fareRuleRepository.save(fareRule);
  }

  /**
   * Get fare rules for a fare
   */
  async getFareRules(fareId: string): Promise<FareRule[]> {
    return await this.fareRuleRepository.find({
      where: { fareId },
    });
  }

  /**
   * Create tax/fee
   */
  async createTaxFee(createTaxFeeDto: CreateTaxFeeDto): Promise<TaxFee> {
    const fare = await this.getFareById(createTaxFeeDto.fareId);
    
    const taxFee = this.taxFeeRepository.create({
      ...createTaxFeeDto,
      calculationType: createTaxFeeDto.calculationType || TaxFeeCalculationType.FIXED,
      currency: createTaxFeeDto.currency || 'USD',
      isActive: createTaxFeeDto.isActive !== undefined ? createTaxFeeDto.isActive : true,
    });

    return await this.taxFeeRepository.save(taxFee);
  }

  /**
   * Get taxes and fees for a fare
   */
  async getTaxFees(fareId: string): Promise<TaxFee[]> {
    return await this.taxFeeRepository.find({
      where: { fareId, isActive: true },
    });
  }

  /**
   * Calculate total taxes and fees for a fare
   */
  private async calculateTaxesAndFees(
    fare: Fare,
    baseFare: number,
    passengerCount: number = 1,
  ): Promise<{ taxes: number; fees: number; breakdown: TaxFeeBreakdown[] }> {
    const taxFees = await this.getTaxFees(fare.id);
    let totalTaxes = 0;
    let totalFees = 0;
    const breakdown: TaxFeeBreakdown[] = [];

    for (const taxFee of taxFees) {
      let amount = 0;

      switch (taxFee.calculationType) {
        case TaxFeeCalculationType.FIXED:
          amount = taxFee.amount * passengerCount;
          break;
        case TaxFeeCalculationType.PERCENTAGE:
          amount = (baseFare * taxFee.amount) / 100;
          if (taxFee.minAmount) amount = Math.max(amount, taxFee.minAmount);
          if (taxFee.maxAmount) amount = Math.min(amount, taxFee.maxAmount);
          amount = amount * passengerCount;
          break;
        case TaxFeeCalculationType.PER_PASSENGER:
          amount = taxFee.amount * passengerCount;
          break;
      }

      // Categorize as tax or fee
      if (
        taxFee.type.includes('Tax') ||
        taxFee.type === 'Airport Tax' ||
        taxFee.type === 'Security Fee' ||
        taxFee.type === 'Passenger Facility Charge'
      ) {
        totalTaxes += amount;
      } else {
        totalFees += amount;
      }

      breakdown.push({
        type: taxFee.type,
        name: taxFee.name,
        amount,
      });
    }

    return { taxes: totalTaxes, fees: totalFees, breakdown };
  }

  /**
   * Apply dynamic pricing based on demand, time, and availability
   */
  private calculateDynamicPricing(fare: Fare): number {
    let adjustment = fare.dynamicPriceAdjustment || 0;

    // Demand-based pricing: adjust based on booked seats
    const occupancyRate = fare.availableSeats > 0 
      ? fare.bookedSeats / (fare.availableSeats + fare.bookedSeats)
      : 0;

    if (occupancyRate > 0.8) {
      // High demand: increase price by 20%
      adjustment += fare.baseFare * 0.2;
    } else if (occupancyRate > 0.6) {
      // Medium-high demand: increase price by 10%
      adjustment += fare.baseFare * 0.1;
    } else if (occupancyRate < 0.3) {
      // Low demand: decrease price by 10%
      adjustment -= fare.baseFare * 0.1;
    }

    // Time-based pricing: adjust based on days until departure
    if (fare.flight && fare.flight.departureDate) {
      const daysUntilDeparture = Math.ceil(
        (new Date(fare.flight.departureDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeparture < 7) {
        // Last minute: increase by 15%
        adjustment += fare.baseFare * 0.15;
      } else if (daysUntilDeparture < 14) {
        // Short notice: increase by 8%
        adjustment += fare.baseFare * 0.08;
      } else if (daysUntilDeparture > 60) {
        // Early booking: decrease by 5%
        adjustment -= fare.baseFare * 0.05;
      }
    }

    // Ensure adjustment doesn't make price negative
    const finalPrice = fare.baseFare + adjustment;
    return Math.max(0, finalPrice);
  }

  /**
   * Calculate total price for a booking
   */
  async calculatePrice(calculatePriceDto: CalculatePriceDto): Promise<PriceCalculationResult> {
    const { flightId, fareClass, passengerCount, promotionalCode, currency } = calculatePriceDto;

    // Find the fare
    const fare = await this.fareRepository.findOne({
      where: { flightId, fareClass, isActive: true },
      relations: ['flight'],
    });

    if (!fare) {
      throw new NotFoundException(
        `Fare not found for flight ${flightId} with class ${fareClass}`
      );
    }

    // Check availability
    if (fare.availableSeats < passengerCount) {
      throw new BadRequestException(
        `Insufficient seats available. Available: ${fare.availableSeats}, Requested: ${passengerCount}`
      );
    }

    // Calculate dynamic pricing
    const dynamicPrice = this.calculateDynamicPricing(fare);
    const baseFarePerPassenger = dynamicPrice;
    const subtotal = baseFarePerPassenger * passengerCount;

    // Calculate taxes and fees
    const { taxes, fees, breakdown } = await this.calculateTaxesAndFees(
      fare,
      baseFarePerPassenger,
      passengerCount
    );

    // Apply promotional code if provided
    let promotionalDiscount = 0;
    let promotionalCodeDetails = null;

    if (promotionalCode) {
      const validation = await this.validatePromotionalCode({
        code: promotionalCode,
        purchaseAmount: subtotal + taxes + fees,
        fareClass,
      });

      if (!validation.isValid) {
        throw new BadRequestException(validation.message || 'Invalid promotional code');
      }

      const promoCode = validation.promotionalCode!;
      
      if (promoCode.type === PromotionalCodeType.PERCENTAGE) {
        promotionalDiscount = ((subtotal + taxes + fees) * promoCode.discountValue!) / 100;
        if (promoCode.maxDiscountAmount) {
          promotionalDiscount = Math.min(promotionalDiscount, promoCode.maxDiscountAmount);
        }
      } else if (promoCode.type === PromotionalCodeType.FIXED_AMOUNT) {
        promotionalDiscount = promoCode.discountValue!;
      }

      promotionalCodeDetails = {
        code: promoCode.code,
        discount: promotionalDiscount,
      };
    }

    const totalAmount = subtotal + taxes + fees - promotionalDiscount;

    return {
      baseFare: fare.baseFare,
      dynamicPriceAdjustment: dynamicPrice - fare.baseFare,
      subtotal,
      taxes,
      fees,
      promotionalDiscount,
      totalAmount: Math.max(0, totalAmount),
      currency: currency || fare.currency,
      fareClass,
      breakdown: {
        baseFare: fare.baseFare,
        dynamicPriceAdjustment: dynamicPrice - fare.baseFare,
        taxes: breakdown.filter((b) => 
          b.type.includes('Tax') || 
          b.type === 'Airport Tax' || 
          b.type === 'Security Fee'
        ),
        fees: breakdown.filter((b) => 
          !b.type.includes('Tax') && 
          b.type !== 'Airport Tax' && 
          b.type !== 'Security Fee'
        ),
        ...(promotionalCodeDetails && { promotionalDiscount: promotionalCodeDetails }),
      },
    };
  }

  /**
   * Validate promotional code
   */
  async validatePromotionalCode(
    validateDto: ValidatePromotionalCodeDto,
  ): Promise<{ isValid: boolean; message?: string; promotionalCode?: PromotionalCode }> {
    const { code, purchaseAmount, fareClass, userId } = validateDto;

    const promotionalCode = await this.promotionalCodeRepository.findOne({
      where: { code },
    });

    if (!promotionalCode) {
      return { isValid: false, message: 'Promotional code not found' };
    }

    // Check status
    if (promotionalCode.status !== PromotionalCodeStatus.ACTIVE) {
      return { isValid: false, message: 'Promotional code is not active' };
    }

    // Check validity dates
    const now = new Date();
    if (now < promotionalCode.validFrom) {
      return { isValid: false, message: 'Promotional code is not yet valid' };
    }

    if (now > promotionalCode.validTo) {
      return { isValid: false, message: 'Promotional code has expired' };
    }

    // Check max uses
    if (promotionalCode.maxUses && promotionalCode.currentUses >= promotionalCode.maxUses) {
      return { isValid: false, message: 'Promotional code has reached maximum uses' };
    }

    // Check minimum purchase amount
    if (purchaseAmount && promotionalCode.minPurchaseAmount) {
      if (purchaseAmount < promotionalCode.minPurchaseAmount) {
        return {
          isValid: false,
          message: `Minimum purchase amount of ${promotionalCode.minPurchaseAmount} required`,
        };
      }
    }

    // Check fare class applicability
    if (promotionalCode.applicableFareClass && fareClass) {
      if (promotionalCode.applicableFareClass !== fareClass) {
        return {
          isValid: false,
          message: `Promotional code not applicable for ${fareClass} class`,
        };
      }
    }

    return { isValid: true, promotionalCode };
  }

  /**
   * Create promotional code
   */
  async createPromotionalCode(
    createPromotionalCodeDto: CreatePromotionalCodeDto,
  ): Promise<PromotionalCode> {
    // Check if code already exists
    const existing = await this.promotionalCodeRepository.findOne({
      where: { code: createPromotionalCodeDto.code },
    });

    if (existing) {
      throw new BadRequestException('Promotional code already exists');
    }

    const promotionalCode = this.promotionalCodeRepository.create({
      ...createPromotionalCodeDto,
      currency: createPromotionalCodeDto.currency || 'USD',
      status: PromotionalCodeStatus.ACTIVE,
      currentUses: 0,
    });

    return await this.promotionalCodeRepository.save(promotionalCode);
  }

  /**
   * Get all promotional codes
   */
  async getPromotionalCodes(activeOnly: boolean = false): Promise<PromotionalCode[]> {
    const where: any = {};
    if (activeOnly) {
      where.status = PromotionalCodeStatus.ACTIVE;
    }

    return await this.promotionalCodeRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get promotional code by code
   */
  async getPromotionalCodeByCode(code: string): Promise<PromotionalCode> {
    const promotionalCode = await this.promotionalCodeRepository.findOne({
      where: { code },
    });

    if (!promotionalCode) {
      throw new NotFoundException(`Promotional code ${code} not found`);
    }

    return promotionalCode;
  }

  /**
   * Apply promotional code (increment usage)
   */
  async applyPromotionalCode(code: string): Promise<void> {
    const promotionalCode = await this.getPromotionalCodeByCode(code);
    
    promotionalCode.currentUses += 1;

    // Update status if max uses reached
    if (promotionalCode.maxUses && promotionalCode.currentUses >= promotionalCode.maxUses) {
      promotionalCode.status = PromotionalCodeStatus.USED_UP;
    }

    await this.promotionalCodeRepository.save(promotionalCode);
  }

  /**
   * Update promotional code
   */
  async updatePromotionalCode(
    id: string,
    updateData: Partial<CreatePromotionalCodeDto>,
  ): Promise<PromotionalCode> {
    const promotionalCode = await this.promotionalCodeRepository.findOne({
      where: { id },
    });

    if (!promotionalCode) {
      throw new NotFoundException(`Promotional code with ID ${id} not found`);
    }

    Object.assign(promotionalCode, updateData);
    return await this.promotionalCodeRepository.save(promotionalCode);
  }

  /**
   * Delete promotional code
   */
  async deletePromotionalCode(id: string): Promise<void> {
    const promotionalCode = await this.promotionalCodeRepository.findOne({
      where: { id },
    });

    if (!promotionalCode) {
      throw new NotFoundException(`Promotional code with ID ${id} not found`);
    }

    await this.promotionalCodeRepository.remove(promotionalCode);
  }
}

