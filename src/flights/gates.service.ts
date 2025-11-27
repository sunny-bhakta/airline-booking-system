import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gate } from './entities/gate.entity';
import { Terminal } from './entities/terminal.entity';
import { CreateGateDto } from './dto/create-gate.dto';
import { UpdateGateDto } from './dto/update-gate.dto';

@Injectable()
export class GatesService {
  constructor(
    @InjectRepository(Gate)
    private gateRepository: Repository<Gate>,
    @InjectRepository(Terminal)
    private terminalRepository: Repository<Terminal>,
  ) {}

  async create(createGateDto: CreateGateDto): Promise<Gate> {
    // Validate terminal exists
    const terminal = await this.terminalRepository.findOne({
      where: { id: createGateDto.terminalId },
    });
    if (!terminal) {
      throw new NotFoundException('Terminal not found');
    }

    // Check for duplicate gate number in the same terminal
    const existingGate = await this.gateRepository.findOne({
      where: {
        terminalId: createGateDto.terminalId,
        number: createGateDto.number,
      },
    });

    if (existingGate) {
      throw new BadRequestException(
        `Gate with number "${createGateDto.number}" already exists in this terminal`,
      );
    }

    const gate = this.gateRepository.create({
      ...createGateDto,
      isActive: createGateDto.isActive ?? true,
    });

    return await this.gateRepository.save(gate);
  }

  async findAll(terminalId?: string): Promise<Gate[]> {
    const where: any = {};
    if (terminalId) {
      where.terminalId = terminalId;
    }

    return await this.gateRepository.find({
      where,
      relations: ['terminal', 'terminal.airport'],
      order: { number: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Gate> {
    const gate = await this.gateRepository.findOne({
      where: { id },
      relations: ['terminal', 'terminal.airport'],
    });

    if (!gate) {
      throw new NotFoundException(`Gate with ID ${id} not found`);
    }

    return gate;
  }

  async update(id: string, updateGateDto: UpdateGateDto): Promise<Gate> {
    const gate = await this.findOne(id);

    // If terminalId is being updated, validate it exists
    if (updateGateDto.terminalId) {
      const terminal = await this.terminalRepository.findOne({
        where: { id: updateGateDto.terminalId },
      });
      if (!terminal) {
        throw new NotFoundException('Terminal not found');
      }
    }

    // If number is being updated, check for duplicates
    if (updateGateDto.number && updateGateDto.number !== gate.number) {
      const existingGate = await this.gateRepository.findOne({
        where: {
          terminalId: updateGateDto.terminalId || gate.terminalId,
          number: updateGateDto.number,
        },
      });

      if (existingGate && existingGate.id !== id) {
        throw new BadRequestException(
          `Gate with number "${updateGateDto.number}" already exists in this terminal`,
        );
      }
    }

    Object.assign(gate, updateGateDto);
    return await this.gateRepository.save(gate);
  }

  async remove(id: string): Promise<void> {
    const gate = await this.findOne(id);
    await this.gateRepository.remove(gate);
  }
}

