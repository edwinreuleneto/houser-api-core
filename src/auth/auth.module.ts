// Dependencies
import { Module } from '@nestjs/common';

// Services
import { AuthService } from './auth.service';

// Controllers
import { AuthController } from './auth.controller';

// Modules
import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [FirebaseModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
