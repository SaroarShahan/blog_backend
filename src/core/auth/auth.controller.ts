import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserDto } from 'src/common/dto/user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() payload: UserDto) {
    return this.authService.register(payload);
  }

  @Post('/login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('/refresh-token')
  refreshToken(@Body() payload: RefreshTokenDto) {
    return this.authService.generateRefreshToken(payload.refreshToken);
  }

  @Post('/logout')
  logout() {
    return this.authService.logout();
  }
}
