import * as admin from 'firebase-admin';
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

// Config Firebase
import FirebaseData from './firebase-config';

//Dto
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(FirebaseData as admin.ServiceAccount),
    });
  }

  async verifyToken(token: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      return decoded;
    } catch (error) {
      this.logger.error('Invalid authentication token', error.stack);
      throw new Error('Token de autenticação inválido');
    }
  }

  async createUserWithPassword(
    email: string,
    password: string,
    name: string,
  ) {
    try {
      try {
        await admin.auth().getUserByEmail(email);
        throw new HttpException(
          { status: 'auth/email-already-exists', message: 'E-mail já cadastrado' },
          HttpStatus.CONFLICT,
        );
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
      }

      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      return firebaseUser;
    } catch (error) {
      this.logger.error('Failed to create firebase user', error.stack);
      throw new HttpException(
        { status: error.code, message: error.message || 'Erro desconhecido' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveOrUpdateUser(createUserDto: CreateUserDto) {
    try {
      let firebaseUser;

      if (createUserDto.firebaseUid) {
        try {
          firebaseUser = await admin.auth().getUser(createUserDto.firebaseUid);
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            this.logger.error('Failed to fetch Firebase user', error.stack);
            throw new HttpException(
              { status: error.code, message: error.message || 'Erro desconhecido' },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      if (!firebaseUser) {
        try {
          firebaseUser = await admin.auth().getUserByEmail(createUserDto.email);
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            this.logger.error('Failed to fetch Firebase user by email', error.stack);
            throw new HttpException(
              { status: error.code, message: error.message || 'Erro desconhecido' },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      if (firebaseUser) {
        firebaseUser = await admin.auth().updateUser(firebaseUser.uid, {
          email: createUserDto.email,
          displayName: createUserDto.name,
          phoneNumber: createUserDto.phone,
        });
      } else {
        firebaseUser = await admin.auth().createUser({
          email: createUserDto.email,
          displayName: createUserDto.name,
          phoneNumber: createUserDto.phone,
        });
      }

      const updatedUser = await admin.auth().getUser(firebaseUser.uid);

      return {
        success: true,
        message: 'Usuário salvo com sucesso.',
        user: {
          uid: updatedUser.uid,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          emailVerified: updatedUser.emailVerified,
          phoneNumber: updatedUser.phoneNumber,
        },
      };
    } catch (error) {
      this.logger.error('Failed to save or update user', error.stack);
      throw new HttpException(
        {
          status: error.code,
          message: error.message || 'Erro ao salvar ou atualizar o usuário.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
