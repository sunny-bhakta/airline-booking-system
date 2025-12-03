import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Baggage } from './entities/baggage.entity';
import { InFlightService } from './entities/in-flight-service.entity';
import { TravelInsurance } from './entities/travel-insurance.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Passenger } from '../bookings/entities/passenger.entity';
import { CreateBaggageDto } from './dto/create-baggage.dto';
import { CreateInFlightServiceDto } from './dto/create-in-flight-service.dto';
import { CreateTravelInsuranceDto } from './dto/create-travel-insurance.dto';
import { UpdateBaggageDto } from './dto/update-baggage.dto';
import { UpdateInFlightServiceDto } from './dto/update-in-flight-service.dto';
import { UpdateTravelInsuranceDto } from './dto/update-travel-insurance.dto';

@Injectable()
export class AncillaryService {
  constructor(
    @InjectRepository(Baggage)
    private baggageRepository: Repository<Baggage>,
    @InjectRepository(InFlightService)
    private inFlightServiceRepository: Repository<InFlightService>,
    @InjectRepository(TravelInsurance)
    private travelInsuranceRepository: Repository<TravelInsurance>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Passenger)
    private passengerRepository: Repository<Passenger>,
  ) {}

  // ========== Baggage Operations ==========

  /**
   * Add baggage to a booking
   */
  async addBaggage(createBaggageDto: CreateBaggageDto): Promise<Baggage> {
    // Validate booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id: createBaggageDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate passenger if provided
    if (createBaggageDto.passengerId) {
      const passenger = await this.passengerRepository.findOne({
        where: {
          id: createBaggageDto.passengerId,
          bookingId: createBaggageDto.bookingId,
        },
      });

      if (!passenger) {
        throw new NotFoundException(
          'Passenger not found or does not belong to this booking',
        );
      }
    }

    const baggage = this.baggageRepository.create({
      ...createBaggageDto,
      currency: createBaggageDto.currency || 'USD',
      quantity: createBaggageDto.quantity || 1,
    });

    return await this.baggageRepository.save(baggage);
  }

  /**
   * Get all baggage for a booking
   */
  async getBaggageByBooking(bookingId: string): Promise<Baggage[]> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return await this.baggageRepository.find({
      where: { bookingId },
      relations: ['passenger'],
    });
  }

  /**
   * Get baggage by ID
   */
  async getBaggageById(id: string): Promise<Baggage> {
    const baggage = await this.baggageRepository.findOne({
      where: { id },
      relations: ['booking', 'passenger'],
    });

    if (!baggage) {
      throw new NotFoundException('Baggage not found');
    }

    return baggage;
  }

  /**
   * Update baggage
   */
  async updateBaggage(
    id: string,
    updateBaggageDto: UpdateBaggageDto,
  ): Promise<Baggage> {
    const baggage = await this.getBaggageById(id);

    Object.assign(baggage, updateBaggageDto);

    return await this.baggageRepository.save(baggage);
  }

  /**
   * Remove baggage
   */
  async removeBaggage(id: string): Promise<void> {
    const baggage = await this.getBaggageById(id);
    await this.baggageRepository.remove(baggage);
  }

  // ========== In-Flight Services Operations ==========

  /**
   * Add in-flight service to a booking
   */
  async addInFlightService(
    createInFlightServiceDto: CreateInFlightServiceDto,
  ): Promise<InFlightService> {
    // Validate booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id: createInFlightServiceDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate passenger if provided
    if (createInFlightServiceDto.passengerId) {
      const passenger = await this.passengerRepository.findOne({
        where: {
          id: createInFlightServiceDto.passengerId,
          bookingId: createInFlightServiceDto.bookingId,
        },
      });

      if (!passenger) {
        throw new NotFoundException(
          'Passenger not found or does not belong to this booking',
        );
      }
    }

    const service = this.inFlightServiceRepository.create({
      ...createInFlightServiceDto,
      currency: createInFlightServiceDto.currency || 'USD',
      quantity: createInFlightServiceDto.quantity || 1,
    });

    return await this.inFlightServiceRepository.save(service);
  }

  /**
   * Get all in-flight services for a booking
   */
  async getInFlightServicesByBooking(
    bookingId: string,
  ): Promise<InFlightService[]> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return await this.inFlightServiceRepository.find({
      where: { bookingId },
      relations: ['passenger'],
    });
  }

  /**
   * Get in-flight service by ID
   */
  async getInFlightServiceById(id: string): Promise<InFlightService> {
    const service = await this.inFlightServiceRepository.findOne({
      where: { id },
      relations: ['booking', 'passenger'],
    });

    if (!service) {
      throw new NotFoundException('In-flight service not found');
    }

    return service;
  }

  /**
   * Update in-flight service
   */
  async updateInFlightService(
    id: string,
    updateInFlightServiceDto: UpdateInFlightServiceDto,
  ): Promise<InFlightService> {
    const service = await this.getInFlightServiceById(id);

    Object.assign(service, updateInFlightServiceDto);

    return await this.inFlightServiceRepository.save(service);
  }

  /**
   * Remove in-flight service
   */
  async removeInFlightService(id: string): Promise<void> {
    const service = await this.getInFlightServiceById(id);
    await this.inFlightServiceRepository.remove(service);
  }

  // ========== Travel Insurance Operations ==========

  /**
   * Add travel insurance to a booking
   */
  async addTravelInsurance(
    createTravelInsuranceDto: CreateTravelInsuranceDto,
  ): Promise<TravelInsurance> {
    // Validate booking exists
    const booking = await this.bookingRepository.findOne({
      where: { id: createTravelInsuranceDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate passenger if provided
    if (createTravelInsuranceDto.passengerId) {
      const passenger = await this.passengerRepository.findOne({
        where: {
          id: createTravelInsuranceDto.passengerId,
          bookingId: createTravelInsuranceDto.bookingId,
        },
      });

      if (!passenger) {
        throw new NotFoundException(
          'Passenger not found or does not belong to this booking',
        );
      }
    }

    // Validate dates
    const startDate = new Date(createTravelInsuranceDto.startDate);
    const endDate = new Date(createTravelInsuranceDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'End date must be after start date',
      );
    }

    const insurance = this.travelInsuranceRepository.create({
      ...createTravelInsuranceDto,
      currency: createTravelInsuranceDto.currency || 'USD',
      startDate,
      endDate,
    });

    return await this.travelInsuranceRepository.save(insurance);
  }

  /**
   * Get all travel insurance for a booking
   */
  async getTravelInsuranceByBooking(
    bookingId: string,
  ): Promise<TravelInsurance[]> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return await this.travelInsuranceRepository.find({
      where: { bookingId },
      relations: ['passenger'],
    });
  }

  /**
   * Get travel insurance by ID
   */
  async getTravelInsuranceById(id: string): Promise<TravelInsurance> {
    const insurance = await this.travelInsuranceRepository.findOne({
      where: { id },
      relations: ['booking', 'passenger'],
    });

    if (!insurance) {
      throw new NotFoundException('Travel insurance not found');
    }

    return insurance;
  }

  /**
   * Update travel insurance
   */
  async updateTravelInsurance(
    id: string,
    updateTravelInsuranceDto: UpdateTravelInsuranceDto,
  ): Promise<TravelInsurance> {
    const insurance = await this.getTravelInsuranceById(id);

    // Handle date updates
    if (updateTravelInsuranceDto.startDate) {
      insurance.startDate = new Date(updateTravelInsuranceDto.startDate);
    }
    if (updateTravelInsuranceDto.endDate) {
      insurance.endDate = new Date(updateTravelInsuranceDto.endDate);
    }

    // Validate dates if both are updated
    if (
      updateTravelInsuranceDto.startDate &&
      updateTravelInsuranceDto.endDate
    ) {
      const startDate = new Date(updateTravelInsuranceDto.startDate);
      const endDate = new Date(updateTravelInsuranceDto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException(
          'End date must be after start date',
        );
      }
    }

    Object.assign(insurance, updateTravelInsuranceDto);
    delete (insurance as any).startDate;
    delete (insurance as any).endDate;

    return await this.travelInsuranceRepository.save(insurance);
  }

  /**
   * Remove travel insurance
   */
  async removeTravelInsurance(id: string): Promise<void> {
    const insurance = await this.getTravelInsuranceById(id);
    await this.travelInsuranceRepository.remove(insurance);
  }

  // ========== Aggregate Operations ==========

  /**
   * Get all ancillary services for a booking
   */
  async getAllAncillaryServicesByBooking(bookingId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const [baggage, inFlightServices, travelInsurance] = await Promise.all([
      this.getBaggageByBooking(bookingId),
      this.getInFlightServicesByBooking(bookingId),
      this.getTravelInsuranceByBooking(bookingId),
    ]);

    // Calculate total ancillary cost
    const totalBaggageCost = baggage.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalServiceCost = inFlightServices.reduce(
      (sum, service) => sum + service.price * service.quantity,
      0,
    );
    const totalInsuranceCost = travelInsurance.reduce(
      (sum, insurance) => sum + insurance.premium,
      0,
    );

    return {
      baggage,
      inFlightServices,
      travelInsurance,
      totals: {
        baggage: totalBaggageCost,
        inFlightServices: totalServiceCost,
        travelInsurance: totalInsuranceCost,
        total: totalBaggageCost + totalServiceCost + totalInsuranceCost,
      },
    };
  }
}

