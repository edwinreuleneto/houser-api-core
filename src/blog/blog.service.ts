// Dependencies
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Services
import { PrismaService } from '../prisma/prisma.service';
import { MongoService } from '../mongo/mongo.service';
import { FilesService } from '../files/files.service';

// DTOs
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { GenerateBlogDto } from './dto/generate-blog.dto';
import { GenerateBlogBatchDto } from './dto/generate-blog-batch.dto';
import { AiService } from '../ai/ai.service';
import { SocialPostService } from '../social-post/social-post.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly aiService: AiService,
    private readonly socialPostService: SocialPostService,
    private readonly mongo: MongoService,
  ) {}

  async create(data: CreateBlogDto, cover?: Express.Multer.File) {
    try {
      let coverId: string | undefined;
      if (cover) {
        const uploaded = await this.filesService.upload(cover, 'blogs');
        coverId = uploaded.id;
      }

      const slugBase = (data.slug?.trim() || this.slugify(data.title)) as string;
      const uniqueSlug = await this.ensureUniqueSlug(slugBase);

      const payload: Prisma.BlogCreateInput = {
        title: data.title,
        slug: uniqueSlug,
        description: data.description,
        content: data.content,
        metaTags: data.metaTags ?? [],
        status: (data.status as any) ?? 'DRAFT',
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        author: { connect: { id: data.authorId } },
        cover: coverId ? { connect: { id: coverId } } : undefined,
      } as any;

      return await this.prisma.blog.create({
        data: payload,
        include: { cover: true, author: true },
      });
    } catch (error) {
      this.logger.error('Failed to create blog post', error.stack);
      throw new InternalServerErrorException('Failed to create blog post');
    }
  }

  async findAll(filter?: FilterBlogDto) {
    try {
      const { page = 1, limit = 10, ...rest } = filter ?? {};
      const skip = (page - 1) * Number(limit);

      const where: Prisma.BlogWhereInput = {
        title: rest.title
          ? { contains: rest.title, mode: 'insensitive' }
          : undefined,
        description: rest.description
          ? { contains: rest.description, mode: 'insensitive' }
          : undefined,
        status: (rest.status as any) || undefined,
        authorId: (rest as any).authorId || undefined,
        metaTags:
          rest.metaTags && rest.metaTags.length
            ? { hasSome: rest.metaTags }
            : undefined,
        publishedAt: rest.publishedAt ? new Date(rest.publishedAt) : undefined,
      } as any;

      const data = await this.prisma.blog.findMany({
        where,
        include: { cover: true, author: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      });
      const total = await this.prisma.blog.count({ where });

      const totalPages = Math.ceil(total / Number(limit));
      return { data, page, totalPages };
    } catch (error) {
      this.logger.error('Failed to list blog posts', error.stack);
      throw new InternalServerErrorException('Failed to list blog posts');
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.blog.findUnique({
        where: { id },
        include: { cover: true, author: true },
      });
    } catch (error) {
      this.logger.error('Failed to get blog post', error);
      throw new InternalServerErrorException('Failed to get blog post');
    }
  }

  async update(id: string, data: UpdateBlogDto, cover?: Express.Multer.File) {
    try {
      let coverId: string | undefined;
      if (cover) {
        const uploaded = await this.filesService.upload(cover, 'blogs');
        coverId = uploaded.id;
      }

      let slug: string | undefined;
      if ((data as any).slug) {
        const base = this.slugify((data as any).slug);
        slug = await this.ensureUniqueSlug(base, id);
      }

      const payload: Prisma.BlogUpdateInput = {
        title: data.title,
        description: data.description,
        content: (data as any).content,
        metaTags: data.metaTags,
        slug,
        status: (data.status as any) || undefined,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        author: data.authorId ? { connect: { id: data.authorId } } : undefined,
        cover: coverId ? { connect: { id: coverId } } : undefined,
      } as any;

      return await this.prisma.blog.update({
        where: { id },
        data: payload,
        include: { cover: true, author: true },
      });
    } catch (error) {
      this.logger.error('Failed to update blog post', error.stack);
      throw new InternalServerErrorException('Failed to update blog post');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.blog.delete({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to remove blog post', error.stack);
      throw new InternalServerErrorException('Failed to remove blog post');
    }
  }

  async addAccessById(id: string, type: 'view' | 'read' = 'view') {
    try {
      const data: Prisma.BlogUpdateInput =
        type === 'read'
          ? ({ readsCount: { increment: 1 } } as any)
          : ({ viewsCount: { increment: 1 } } as any);
      const updated = await this.prisma.blog.update({
        where: { id },
        data,
        select: { id: true, viewsCount: true, readsCount: true },
      });
      try {
        await this.mongo.collection('blog_access').insertOne({
          blogId: updated.id,
          type,
        } as any);
      } catch (e) {
        this.logger.warn('Failed to log blog access to Mongo', e as any);
      }
      return updated;
    } catch (error) {
      this.logger.error('Failed to add blog access by id', error?.stack || error);
      throw new InternalServerErrorException('Failed to add blog access');
    }
  }

  async addAccessBySlug(slug: string, type: 'view' | 'read' = 'view') {
    if (!slug) throw new BadRequestException('slug is required');
    try {
      const data: Prisma.BlogUpdateInput =
        type === 'read'
          ? ({ readsCount: { increment: 1 } } as any)
          : ({ viewsCount: { increment: 1 } } as any);
      const updated = await this.prisma.blog.update({
        where: { slug },
        data,
        select: { id: true, viewsCount: true, readsCount: true, slug: true },
      });
      try {
        await this.mongo.collection('blog_access').insertOne({
          blogId: updated.id,
          type,
        } as any);
      } catch (e) {
        this.logger.warn('Failed to log blog access to Mongo', e as any);
      }
      return updated;
    } catch (error) {
      this.logger.error('Failed to add blog access by slug', error?.stack || error);
      throw new InternalServerErrorException('Failed to add blog access');
    }
  }

  async generateWithAi(data: GenerateBlogDto) {
    try {
      const generated = await this.aiService.generateBlogPost({
        prompt: data.prompt,
      });

      let cover: { id: string } | undefined;
      if (generated.imageBase64 && generated.imageFilename) {
        this.logger.log(
          `Uploading AI cover image filename=${generated.imageFilename} size=${generated.imageBase64.length} bytes`,
        );
        const uploaded = await this.filesService.uploadBase64(
          generated.imageBase64,
          generated.imageFilename,
          'blogs',
        );
        cover = { id: uploaded.id };
        this.logger.log(`AI cover image stored with id=${uploaded.id}`);
      } else {
        this.logger.log('No AI cover image present; skipping cover upload.');
      }

      const payload: Prisma.BlogCreateInput = {
        title: generated.title,
        slug: await this.ensureUniqueSlug(
          this.slugify(generated.slug || generated.title),
        ),
        description: generated.description,
        content: generated.content,
        metaTags: generated.metaTags ?? [],
        status: ((data.status as any) ?? 'DRAFT') as any,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        author: { connect: { id: data.authorId } },
        cover: cover ? { connect: cover } : undefined,
      } as any;

      const created = await this.prisma.blog.create({
        data: payload,
        include: { cover: true, author: true },
      });
      this.logger.log(
        `Blog created id=${created.id} coverId=${created.cover?.id ?? 'none'}`,
      );
      const baseUrl = process.env.FRONT_BLOG_URL || 'https://houser.com/blog';
      const permalink = created.slug ? `${baseUrl}/${created.slug}` : undefined;
      const linkedInContent = generated.socialLinkedin
        ? `${generated.socialLinkedin}\n\n${permalink ?? ''}`.trim()
        : undefined;
      await this.socialPostService.createManyForBlog({
        blogId: created.id,
        socialLinkedin: linkedInContent,
        socialInstagram: generated.socialInstagram,
      });
      return created;
    } catch (error) {
      this.logger.error('Failed to generate blog with AI', error.stack);
      throw new InternalServerErrorException('Failed to generate blog with AI');
    }
  }

  async generateManyWithAi(data: GenerateBlogBatchDto) {
    const results = [] as any[];
    for (const topic of data.prompts) {
      try {
        const created = await this.generateWithAi({
          prompt: topic,
          authorId: data.authorId,
          status: data.status,
          publishedAt: data.publishedAt,
        } as any);
        results.push(created);
      } catch (err) {
        this.logger.error(`Failed to generate topic: ${topic}`, (err as any)?.stack || err);
      }
    }
    return results;
  }
  private slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  private async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const clean = this.slugify(base);
    const existing = await this.prisma.blog.findMany({
      where: {
        slug: { startsWith: clean },
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: { slug: true },
    });
    if (!existing.length) return clean;
    const set = new Set(existing.map((e) => e.slug));
    if (!set.has(clean)) return clean;
    let i = 2;
    while (set.has(`${clean}-${i}`)) i++;
    return `${clean}-${i}`;
  }
}
