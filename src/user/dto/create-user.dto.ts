// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  firebaseUid?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  givenName?: string;

  @ApiPropertyOptional()
  surname?: string;

  @ApiPropertyOptional()
  userPrincipalName?: string;

  @ApiPropertyOptional()
  jobTitle?: string;

  @ApiPropertyOptional()
  department?: string;

  @ApiPropertyOptional()
  officeLocation?: string;

  @ApiPropertyOptional()
  mobilePhone?: string;

  @ApiPropertyOptional()
  businessPhone?: string;

  @ApiPropertyOptional()
  fileId?: string;

  @ApiPropertyOptional()
  active?: boolean;

  @ApiPropertyOptional()
  externalActive?: boolean;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  threadId?: string;

  @ApiPropertyOptional({ enum: AuthProvider, default: AuthProvider.local })
  provider?: AuthProvider = AuthProvider.local;
}
