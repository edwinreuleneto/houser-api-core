// Dependencies
import { Module } from '@nestjs/common';

// Controller
import { AppController } from './app.controller';

// Services
import { AppService } from './app.service';

// Modules
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';
import { FilesModule } from './files/files.module';
import { ContractsModule } from './contracts/contracts.module';
import { MongoModule } from './mongo/mongo.module';
import { HouseEstimateModule } from './house-estimate/house-estimate.module';
import { SalesModule } from './sales/sales.module';
import { WaitingListModule } from './waiting-list/waiting-list.module';
import { BlogModule } from './blog/blog.module';
import { SocialPostModule } from './social-post/social-post.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    UserModule,
    AuthModule,
    S3Module,
    FilesModule,
    ContractsModule,
    MongoModule,
    HouseEstimateModule,
    SalesModule,
    WaitingListModule,
    BlogModule,
    SocialPostModule,
    DashboardModule,
    QueuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
