// Dependencies
import { Injectable, Logger } from '@nestjs/common';
import { Queue, JobsOptions } from 'bullmq';

@Injectable()
export class QueuesService {
  private readonly logger = new Logger(QueuesService.name);
  private readonly connection = (() => {
    const url = process.env.REDIS_URL;
    if (url && url.trim().length) {
      return { url } as any;
    }
    const tls = (process.env.REDIS_TLS || '').toLowerCase() === 'true';
    const conn: any = {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASSWORD,
      connectTimeout: 5000,
    };
    if (tls) {
      conn.tls = { rejectUnauthorized: false };
    }
    return conn;
  })();

  // Lazy registries to reuse instances
  private queues = new Map<string, Queue>();
  // v5: QueueScheduler not required; relying on default handling.

  queue(name: string): Queue {
    if (!this.queues.has(name)) {
      const q = new Queue(name, { connection: this.connection });
      this.queues.set(name, q);
      this.logger.log(`Queue created: ${name}`);
    }
    return this.queues.get(name)!;
  }

  // No QueueEvents registry needed for this scope

  async add<T = any>(name: string, payload: T, opts?: JobsOptions) {
    const q = this.queue(name);
    const job = await q.add(name, payload, {
      removeOnComplete: { age: 3600, count: 1000 },
      removeOnFail: { age: 86400, count: 1000 },
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      ...opts,
    });
    return job;
  }
}
