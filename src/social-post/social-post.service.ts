import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSocialPostDto, CreateManyForBlogDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';

@Injectable()
export class SocialPostService {
  private readonly logger = new Logger(SocialPostService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSocialPostDto) {
    try {
      return await this.prisma.socialPost.create({ data: dto as any });
    } catch (error) {
      this.logger.error('Failed to create social post', error.stack || error);
      throw new InternalServerErrorException('Failed to create social post');
    }
  }

  async createManyForBlog(dto: CreateManyForBlogDto) {
    const ops: any[] = [];
    if (dto.socialLinkedin) {
      ops.push(
        this.prisma.socialPost.create({
          data: { blogId: dto.blogId, platform: 'LINKEDIN', content: dto.socialLinkedin } as any,
        }),
      );
    }
    if (dto.socialInstagram) {
      ops.push(
        this.prisma.socialPost.create({
          data: { blogId: dto.blogId, platform: 'INSTAGRAM', content: dto.socialInstagram } as any,
        }),
      );
    }
    if (!ops.length) return [];
    const res = await Promise.allSettled(ops);
    return res
      .filter((r) => r.status === 'fulfilled')
      .map((r: any) => r.value);
  }

  async findAll(blogId?: string, platform?: 'LINKEDIN' | 'INSTAGRAM') {
    try {
      return await this.prisma.socialPost.findMany({
        where: { blogId: blogId || undefined, platform: (platform as any) || undefined },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to list social posts', error.stack || error);
      throw new InternalServerErrorException('Failed to list social posts');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.socialPost.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to get social post', error.stack || error);
      throw new InternalServerErrorException('Failed to get social post');
    }
  }

  async update(id: string, dto: UpdateSocialPostDto) {
    try {
      return await this.prisma.socialPost.update({ where: { id }, data: dto as any });
    } catch (error) {
      this.logger.error('Failed to update social post', error.stack || error);
      throw new InternalServerErrorException('Failed to update social post');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.socialPost.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to remove social post', error.stack || error);
      throw new InternalServerErrorException('Failed to remove social post');
    }
  }
}

