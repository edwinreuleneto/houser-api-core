// Dependencies
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Client, ResponseType } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';

// Services
import { UserService } from '../user/user.service';
import { FilesService } from '../files/files.service';

// DTOs
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthProvider } from '@prisma/client';

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);
  private readonly graphClient: Client;

  constructor(
    private readonly userService: UserService,
    private readonly filesService: FilesService,
  ) {
    const credential = new ClientSecretCredential(
      process.env.GRAPH_TENANT_ID ?? '',
      process.env.GRAPH_CLIENT_ID ?? '',
      process.env.GRAPH_CLIENT_SECRET ?? '',
    );

    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token?.token ?? '';
        },
      },
    });
  }

  async getUsersWithPhotos() {
    try {
      const result = await this.graphClient
        .api('/users')
        .select(
          'id,displayName,givenName,surname,userPrincipalName,mail,accountEnabled,jobTitle,department,officeLocation,mobilePhone,businessPhones',
        )
        .top(999)
        .get();
      const users = [] as Array<CreateUserDto & { fileId?: string }>;
      for (const item of result.value) {
        const photo = await this.fetchUserPhoto(item.id);
        let fileId: string | undefined;
        if (photo) {
          const file = await this.filesService.uploadBase64(
            photo,
            `${item.id}.jpg`,
            'users',
          );
          fileId = file.id;
        }
        users.push({
          email: item.mail ?? item.userPrincipalName,
          name: item.displayName,
          givenName: item.givenName,
          surname: item.surname,
          userPrincipalName: item.userPrincipalName,
          jobTitle: item.jobTitle,
          department: item.department,
          officeLocation: item.officeLocation,
          mobilePhone: item.mobilePhone,
          businessPhone: item.businessPhones?.[0],
          provider: AuthProvider.microsoft,
          externalActive: item.accountEnabled,
          fileId,
        });
      }
      return users;
    } catch (error) {
      this.logger.error('Failed to fetch users from Microsoft Graph', error.stack);
      throw new InternalServerErrorException('Failed to fetch users from Microsoft Graph');
    }
  }

  private async fetchUserPhoto(userId: string): Promise<string | undefined> {
    try {
      const arrayBuffer = await this.graphClient
        .api(`/users/${userId}/photo/$value`)
        .responseType(ResponseType.ARRAYBUFFER)
        .get();
      const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
      return buffer.toString('base64');
    } catch (error) {
      this.logger.warn(`Photo not found for user ${userId}`);
      return undefined;
    }
  }

  async syncUsers() {
    try {
      const users = await this.getUsersWithPhotos();
      for (const user of users) {
        const existing = await this.userService.findByEmail(
          user.email.toLocaleLowerCase(),
        );
        if (existing) {
          await this.userService.update(existing.id, user);
        } else {
          await this.userService.create(user);
        }

      }
      return { success: true, total: users.length };
    } catch (error) {
      this.logger.error('Failed to sync users', error.stack);
      throw new InternalServerErrorException('Failed to sync users');
    }
  }
}
