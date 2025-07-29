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
import { GraphModule } from './graph/graph.module';
import { S3Module } from './s3/s3.module';
import { FilesModule } from './files/files.module';
import { ContractsModule } from './contracts/contracts.module';
import { MongoModule } from './mongo/mongo.module';
import { HouseEstimateModule } from './house-estimate/house-estimate.module';

@Module({
  imports: [
    PrismaModule,
    FirebaseModule,
    UserModule,
    AuthModule,
    GraphModule,
    S3Module,
    FilesModule,
    ContractsModule,
    MongoModule,
    HouseEstimateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
