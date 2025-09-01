// Dependencies
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Interval = 'day' | 'week' | 'month';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    try {
      const [total, byStatus, last30, last7, avgPublish, withCover, withMetaTags, withSocial, linkedinCount, instagramCount] = await Promise.all([
        this.prisma.blog.count(),
        this._countByStatus(),
        this.prisma.blog.count({ where: { createdAt: { gte: this._daysAgo(30) } } }),
        this.prisma.blog.count({ where: { createdAt: { gte: this._daysAgo(7) } } }),
        this._avgTimeToPublishDays(),
        this.prisma.blog.count({ where: { coverId: { not: null } } }),
        this.prisma.blog.count({ where: { metaTags: { isEmpty: false } as any } }),
        this.prisma.blog.count({ where: { socialPosts: { some: {} } } }),
        this.prisma.socialPost.count({ where: { platform: 'LINKEDIN' as any } }),
        this.prisma.socialPost.count({ where: { platform: 'INSTAGRAM' as any } }),
      ]);

      const missing = {
        withoutCover: total - withCover,
        withoutMetaTags: total - withMetaTags,
        withoutSocial: total - withSocial,
      };

      const socialCoverage = {
        blogsWithAnySocial: withSocial,
        linkedinPosts: linkedinCount,
        instagramPosts: instagramCount,
      };

      return {
        blogs: {
          total,
          byStatus,
          createdLast30Days: last30,
          createdLast7Days: last7,
          avgTimeToPublishDays: avgPublish,
          missing,
          socialCoverage,
        },
      };
    } catch (error) {
      this.logger.error('Failed to build overview', (error as any).stack || error);
      throw new InternalServerErrorException('Failed to build overview');
    }
  }

  async timeseries(range: string = '30d', interval: Interval = 'day') {
    try {
      const now = new Date();
      const start = this._parseRangeStart(range);
      const buckets = this._buildBuckets(start, now, interval);

      const blogs = await this.prisma.blog.findMany({
        where: { createdAt: { gte: start } },
        select: { createdAt: true, publishedAt: true },
      });

      const createdSeries = buckets.map((b) => ({ t: b.label, c: 0 }));
      const publishedSeries = buckets.map((b) => ({ t: b.label, c: 0 }));

      for (const b of blogs) {
        const iCreated = this._bucketIndex(b.createdAt, buckets);
        if (iCreated >= 0) createdSeries[iCreated].c++;
        if (b.publishedAt) {
          const iPub = this._bucketIndex(b.publishedAt, buckets);
          if (iPub >= 0) publishedSeries[iPub].c++;
        }
      }

      return { range: { start, end: now, interval }, created: createdSeries, published: publishedSeries };
    } catch (error) {
      this.logger.error('Failed to build timeseries', (error as any).stack || error);
      throw new InternalServerErrorException('Failed to build timeseries');
    }
  }

  async topTags(limit = 20) {
    try {
      const blogs = await this.prisma.blog.findMany({ select: { metaTags: true } });
      const freq = new Map<string, number>();
      for (const b of blogs) {
        for (const tag of b.metaTags || []) {
          const t = (tag || '').toLowerCase();
          if (!t) continue;
          freq.set(t, (freq.get(t) || 0) + 1);
        }
      }
      const list = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, Number(limit));
      return list.map(([tag, count]) => ({ tag, count }));
    } catch (error) {
      this.logger.error('Failed to compute top tags', (error as any).stack || error);
      throw new InternalServerErrorException('Failed to compute top tags');
    }
  }

  async topAuthors(limit = 10) {
    try {
      const rows = await (this.prisma as any).blog.groupBy({
        by: ['authorId'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: Number(limit),
      });
      const authors = await this.prisma.user.findMany({ where: { id: { in: rows.map((r: any) => r.authorId) } } });
      const map = new Map(authors.map((u) => [u.id, u]));
      return rows.map((r: any) => ({
        authorId: r.authorId,
        count: r._count._all,
        author: map.get(r.authorId) ? { id: map.get(r.authorId)!.id, email: map.get(r.authorId)!.email, name: (map.get(r.authorId)!.name || null) } : null,
      }));
    } catch (error) {
      this.logger.error('Failed to compute top authors', (error as any).stack || error);
      throw new InternalServerErrorException('Failed to compute top authors');
    }
  }

  // Helpers
  private _daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  private async _countByStatus() {
    const statuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
    const entries = await Promise.all(
      statuses.map((s) => this.prisma.blog.count({ where: { status: s as any } }).then((c) => [s, c] as const)),
    );
    return Object.fromEntries(entries);
  }

  private async _avgTimeToPublishDays() {
    const pubs = await this.prisma.blog.findMany({ where: { publishedAt: { not: null } }, select: { createdAt: true, publishedAt: true } });
    if (!pubs.length) return 0;
    const totalMs = pubs.reduce((acc, b) => acc + (b.publishedAt!.getTime() - b.createdAt.getTime()), 0);
    return Number((totalMs / pubs.length / (1000 * 60 * 60 * 24)).toFixed(2));
  }

  private _parseRangeStart(range: string) {
    const m = String(range || '').match(/^(\d+)([dwmy])$/i);
    const d = new Date();
    if (!m) return this._daysAgo(30);
    const n = parseInt(m[1], 10);
    const u = m[2].toLowerCase();
    if (u === 'd') d.setDate(d.getDate() - n);
    else if (u === 'w') d.setDate(d.getDate() - n * 7);
    else if (u === 'm') d.setMonth(d.getMonth() - n);
    else if (u === 'y') d.setFullYear(d.getFullYear() - n);
    return d;
  }

  private _buildBuckets(start: Date, end: Date, interval: Interval) {
    const buckets: { from: Date; to: Date; label: string }[] = [];
    const cur = new Date(start);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    while (cur <= end) {
      let from = new Date(cur);
      let to: Date;
      let label: string;
      if (interval === 'day') {
        to = new Date(from);
        to.setDate(to.getDate() + 1);
        label = fmt(from);
      } else if (interval === 'week') {
        to = new Date(from);
        to.setDate(to.getDate() + 7);
        label = fmt(from) + ' (wk)';
      } else {
        to = new Date(from);
        to.setMonth(to.getMonth() + 1);
        label = from.getFullYear() + '-' + String(from.getMonth() + 1).padStart(2, '0');
      }
      buckets.push({ from, to, label });
      cur.setTime(to.getTime());
    }
    return buckets;
  }

  private _bucketIndex(date: Date, buckets: { from: Date; to: Date }[]) {
    const ts = date.getTime();
    for (let i = 0; i < buckets.length; i++) {
      if (ts >= buckets[i].from.getTime() && ts < buckets[i].to.getTime()) return i;
    }
    return -1;
  }
}

