// Dependencies
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';

// Services
import { QueuesService } from '../queues.service';
import { BlogService } from '../../blog/blog.service';

const QUEUE_NAME = 'ai-blog';

@Injectable()
export class AiBlogQueue implements OnModuleInit {
  private readonly logger = new Logger(AiBlogQueue.name);
  private worker?: Worker;

  constructor(
    private readonly queues: QueuesService,
    private readonly blogService: BlogService,
  ) {}

  onModuleInit() {
    // Create worker to process AI blog generation in background
    this.worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        this.logger.log(`Processing job id=${job.id}`);
        // job.data must contain the same payload accepted by BlogService.generateWithAi
        const created = await this.blogService.generateWithAi(job.data);
        return created;
      },
      {
        connection: (this.queues as any).connection,
        concurrency: Number(process.env.AI_QUEUE_CONCURRENCY || 1),
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job completed id=${job.id}`);
    });
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job failed id=${job?.id} error=${err?.message}`);
    });
  }

  async enqueue(payload: any) {
    const job = await this.queues.add(QUEUE_NAME, payload);
    return { jobId: String(job.id) };
  }

  async getStatus(jobId: string) {
    const queue = this.queues.queue(QUEUE_NAME);
    const job = await queue.getJob(jobId);
    if (!job) return { status: 'not_found' };
    const state = await job.getState();
    if (state === 'completed') {
      return { status: state, result: job.returnvalue };
    }
    if (state === 'failed') {
      return { status: state, reason: job.failedReason };
    }
    const progress = typeof job.progress === 'number' ? job.progress : undefined;
    return { status: state, progress };
  }
}

