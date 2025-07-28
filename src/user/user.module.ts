// Dependencies
import { Module } from '@nestjs/common';

// Services
import { PrismaModule } from '../prisma/prisma.module';

// Local
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
