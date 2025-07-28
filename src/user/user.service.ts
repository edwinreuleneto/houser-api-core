// Dependencies
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Services
import { PrismaService } from '../prisma/prisma.service';

// DTOs
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(filter?: FilterUserDto) {
    try {
      const { page = 1, limit = 10, ...whereFilter } = filter ?? {};
      const where: Prisma.UserWhereInput = whereFilter;
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          include: { photo: true },
          skip,
          take: Number(limit),
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / Number(limit));

      return {
        data,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Failed to list users', error);
      throw new InternalServerErrorException('Failed to list users');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: { photo: true },
      });
    } catch (error) {
      this.logger.error('Failed to get user', error);
      throw new InternalServerErrorException('Failed to get user');
    }
  }

  async findByFirebaseUid(firebaseUid: string) {
    try {
      return await this.prisma.user.findUnique({ where: { firebaseUid } });
    } catch (error) {
      this.logger.error('Failed to get user', error);
      throw new InternalServerErrorException('Failed to get user');
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      this.logger.error('Failed to get user', error);
      throw new InternalServerErrorException('Failed to get user');
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      this.logger.error('Failed to update user', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to remove user', error);
      throw new InternalServerErrorException('Failed to remove user');
    }
  }
}
