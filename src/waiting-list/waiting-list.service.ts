// Dependencies
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

// Services
import { PrismaService } from '../prisma/prisma.service';

// DTOs
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import { UpdateWaitingListDto } from './dto/update-waiting-list.dto';
import { FilterWaitingListDto } from './dto/filter-waiting-list.dto';

@Injectable()
export class WaitingListService {
  private readonly logger = new Logger(WaitingListService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createWaitingListDto: CreateWaitingListDto) {
    try {
      return await this.prisma.waitingList.create({ data: createWaitingListDto });
    } catch (error) {
      this.logger.error('Failed to create waiting list entry', error);
      throw new InternalServerErrorException('Failed to create waiting list entry');
    }
  }

  async findAll(filter?: FilterWaitingListDto) {
    try {
      const { page = 1, limit = 10 } = filter ?? {};
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.waitingList.findMany({ skip, take: Number(limit) }),
        this.prisma.waitingList.count(),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      return { data, page, totalPages };
    } catch (error) {
      this.logger.error('Failed to list waiting list entries', error);
      throw new InternalServerErrorException('Failed to list waiting list entries');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.waitingList.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get waiting list entry', error);
      throw new InternalServerErrorException('Failed to get waiting list entry');
    }
  }

  async update(id: string, updateWaitingListDto: UpdateWaitingListDto) {
    try {
      return await this.prisma.waitingList.update({
        where: { id },
        data: updateWaitingListDto,
      });
    } catch (error) {
      this.logger.error('Failed to update waiting list entry', error);
      throw new InternalServerErrorException('Failed to update waiting list entry');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.waitingList.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to remove waiting list entry', error);
      throw new InternalServerErrorException('Failed to remove waiting list entry');
    }
  }
}
