// Dependencies
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Prisma, Contract } from '@prisma/client';

// Services
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { OpenaiService } from '../openai/openai.service';

// DTOs
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly openaiService: OpenaiService,
  ) {}

  async create(data: CreateContractDto): Promise<Contract> {
    try {
      const { attachmentIds, ...contractData } = data;
      const contract = await this.prisma.contract.create({
        data: contractData as Prisma.ContractCreateInput,
      });
      if (attachmentIds?.length) {
        await this.prisma.file.updateMany({
          where: { id: { in: attachmentIds } },
          data: { contractId: contract.id },
        });
      }
      return contract;
    } catch (error) {
      this.logger.error('Failed to create contract', error.stack);
      throw new InternalServerErrorException('Failed to create contract');
    }
  }

  async createFromFile(file: Express.Multer.File): Promise<Contract> {
    try {
      const uploaded = await this.filesService.upload(file, 'contracts');
      const text = file.buffer.toString('utf8');
      const extracted = await this.openaiService.extractContractData(text);
      const contract = await this.prisma.contract.create({
        data: {
          companyName: extracted.companyName,
          description: extracted.description,
          website: extracted.website,
          startDate: new Date(extracted.startDate),
          endDate: extracted.endDate ? new Date(extracted.endDate) : undefined,
        },
      });
      await this.prisma.file.update({
        where: { id: uploaded.id },
        data: { contractId: contract.id },
      });
      return contract;
    } catch (error) {
      this.logger.error('Failed to create contract from file', error.stack);
      throw new InternalServerErrorException('Failed to create contract');
    }
  }

  async findAll() {
    try {
      return await this.prisma.contract.findMany({ include: { files: true } });
    } catch (error) {
      this.logger.error('Failed to list contracts', error.stack);
      throw new InternalServerErrorException('Failed to list contracts');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.contract.findUnique({
        where: { id },
        include: { files: true },
      });
    } catch (error) {
      this.logger.error('Failed to get contract', error.stack);
      throw new InternalServerErrorException('Failed to get contract');
    }
  }

  async update(id: string, data: UpdateContractDto) {
    try {
      const { attachmentIds, ...contractData } = data;
      const updated = await this.prisma.contract.update({
        where: { id },
        data: contractData as Prisma.ContractUpdateInput,
      });
      if (attachmentIds?.length) {
        await this.prisma.file.updateMany({
          where: { id: { in: attachmentIds } },
          data: { contractId: id },
        });
      }
      return updated;
    } catch (error) {
      this.logger.error('Failed to update contract', error.stack);
      throw new InternalServerErrorException('Failed to update contract');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.contract.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to remove contract', error.stack);
      throw new InternalServerErrorException('Failed to remove contract');
    }
  }
}
