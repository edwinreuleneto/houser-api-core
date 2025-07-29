// Dependencies
import { Injectable, Logger } from '@nestjs/common';

// Services
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';

// DTOs
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService,
  ) {}

  async verifyFirebaseToken(token: string) {
    try {
      return await this.firebaseService.verifyToken(token);
    } catch (error) {
      this.logger.error('Failed to verify Firebase token', error);
      throw error;
    }
  }

  async login({ token }: LoginDto) {
    try {
      const decoded = await this.firebaseService.verifyToken(token);
      const user = await this.userService.findByFirebaseUid(decoded.uid);
      return { token, user };
    } catch (error) {
      this.logger.error('Failed to login', error);
      throw error;
    }
  }

  async signup(data: SignupDto) {
    try {
      const firebaseUser = await this.firebaseService.createUserWithPassword(
        data.email,
        data.password,
        data.name,
      );

      await this.userService.create({
        email: firebaseUser.email!,
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName ?? data.name,
      });

      return { uid: firebaseUser.uid, email: firebaseUser.email };
    } catch (error) {
      this.logger.error('Failed to signup', error);
      throw error;
    }
  }
}
