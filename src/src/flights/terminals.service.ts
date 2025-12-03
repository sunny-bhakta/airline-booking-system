import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Terminal } from './entities/terminal.entity';
import { Airport } from './entities/airport.entity';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Injectable()
export class TerminalsService {
  constructor(
    @InjectRepository(Terminal)
    private terminalRepository: Repository<Terminal>,
    @InjectRepository(Airport)
    private airportRepository: Repository<Airport>,
  ) {}

  async create(createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    // Validate airport exists
    const airport = await this.airportRepository.findOne({
      where: { id: createTerminalDto.airportId },
    });
    if (!airport) {
      throw new NotFoundException('Airport not found');
    }

    // Check for duplicate terminal name in the same airport
    const existingTerminal = await this.terminalRepository.findOne({
      where: {
        airportId: createTerminalDto.airportId,
        name: createTerminalDto.name,
      },
    });

    if (existingTerminal) {
      throw new BadRequestException(
        `Terminal with name "${createTerminalDto.name}" already exists in this airport`,
      );
    }

    const terminal = this.terminalRepository.create({
      ...createTerminalDto,
      isActive: createTerminalDto.isActive ?? true,
    });

    return await this.terminalRepository.save(terminal);
  }

  async findAll(airportId?: string): Promise<Terminal[]> {
    const where: any = {};
    if (airportId) {
      where.airportId = airportId;
    }

    return await this.terminalRepository.find({
      where,
      relations: ['airport', 'gates'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Terminal> {
    const terminal = await this.terminalRepository.findOne({
      where: { id },
      relations: ['airport', 'gates'],
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    return terminal;
  }

  async update(
    id: string,
    updateTerminalDto: UpdateTerminalDto,
  ): Promise<Terminal> {
    const terminal = await this.findOne(id);

    // If airportId is being updated, validate it exists
    if (updateTerminalDto.airportId) {
      const airport = await this.airportRepository.findOne({
        where: { id: updateTerminalDto.airportId },
      });
      if (!airport) {
        throw new NotFoundException('Airport not found');
      }
    }

    // If name is being updated, check for duplicates
    if (updateTerminalDto.name && updateTerminalDto.name !== terminal.name) {
      const existingTerminal = await this.terminalRepository.findOne({
        where: {
          airportId: updateTerminalDto.airportId || terminal.airportId,
          name: updateTerminalDto.name,
        },
      });

      if (existingTerminal && existingTerminal.id !== id) {
        throw new BadRequestException(
          `Terminal with name "${updateTerminalDto.name}" already exists in this airport`,
        );
      }
    }

    Object.assign(terminal, updateTerminalDto);
    return await this.terminalRepository.save(terminal);
  }

  async remove(id: string): Promise<void> {
    const terminal = await this.findOne(id);
    await this.terminalRepository.remove(terminal);
  }
}

