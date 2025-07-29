// Dependencies
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Services
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';

// DTOs
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { FilterSaleDto } from './dto/filter-sale.dto';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  async create(data: CreateSaleDto, photo?: Express.Multer.File) {
    try {
      let photoId: string | undefined;
      if (photo) {
        const uploaded = await this.filesService.upload(photo, 'sales');
        photoId = uploaded.id;
      }
      return await this.prisma.sale.create({
        data: { ...data, photoId } as Prisma.SaleCreateInput,
        include: { photo: true },
      });
    } catch (error) {
      this.logger.error('Failed to create sale', error.stack);
      throw new InternalServerErrorException('Failed to create sale');
    }
  }

  async findAll(filter?: FilterSaleDto) {
    try {
      const { page = 1, limit = 10, ...where } = filter ?? {};
      const skip = (page - 1) * limit;
      const [data, total] = await this.prisma.$transaction([
        this.prisma.sale.findMany({
          where,
          include: { photo: true },
          skip,
          take: Number(limit),
        }),
        this.prisma.sale.count({ where }),
      ]);
      const totalPages = Math.ceil(total / Number(limit));
      return { data, page, totalPages };
    } catch (error) {
      this.logger.error('Failed to list sales', error.stack);
      throw new InternalServerErrorException('Failed to list sales');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.sale.findUnique({
        where: { id },
        include: { photo: true },
      });
    } catch (error) {
      this.logger.error('Failed to get sale', error.stack);
      throw new InternalServerErrorException('Failed to get sale');
    }
  }

  async update(id: string, data: UpdateSaleDto, photo?: Express.Multer.File) {
    try {
      let photoId: string | undefined;
      if (photo) {
        const uploaded = await this.filesService.upload(photo, 'sales');
        photoId = uploaded.id;
      }
      return await this.prisma.sale.update({
        where: { id },
        data: { ...data, photoId } as Prisma.SaleUpdateInput,
        include: { photo: true },
      });
    } catch (error) {
      this.logger.error('Failed to update sale', error.stack);
      throw new InternalServerErrorException('Failed to update sale');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.sale.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to remove sale', error.stack);
      throw new InternalServerErrorException('Failed to remove sale');
    }
  }
}
