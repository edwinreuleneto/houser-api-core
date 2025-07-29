// Dependencies
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// Decorators
import { Public } from '../common/decorators/public.decorator';

// Services
import { AuthService } from './auth.service';

// DTOs
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Verifica e decodifica token Firebase' })
  verifyToken(@Body('token') token: string) {
    return this.authService.verifyFirebaseToken(token);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Efetua login e retorna usuário' })
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Cadastro por e-mail e senha' })
  signup(@Body() data: SignupDto) {
    return this.authService.signup(data);
  }
}
