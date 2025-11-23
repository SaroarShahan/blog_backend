import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginAuthDto } from './dto/login-auth.dto';
import { UserDto } from 'src/common/dto/user.dto';
import { UserService } from '../user/user.service';
import { User } from '../user/schema/user.schema';
import { MongoidDto } from 'src/common/dto/mongoid.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(paylod: UserDto): Promise<{
    message: string;
    success: boolean;
    data: User;
  }> {
    try {
      const { username, email, password, ...restPayload } = paylod;

      if (!username || !email || !password) {
        throw new BadRequestException(
          'Username, email, and password are required',
        );
      }

      const existingUser = await this.userService.findByEmail(email);

      if (existingUser) throw new BadRequestException('User already exists');

      const hashedPassword = await this.userService.hashPassword(password);

      const user = await this.userService.saveUser({
        ...restPayload,
        username,
        email,
        password: hashedPassword,
      });

      return {
        message: 'Registration has been completed successfully!',
        success: true,
        data: user,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async login(paylod: LoginAuthDto) {
    try {
      const { email, password } = paylod;

      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new BadRequestException('Wrong email or password');
      }

      const isPasswordMatched = await this.userService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordMatched) {
        throw new BadRequestException('Wrong email or password');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          id: user._id,
        },
        {
          expiresIn: '1h',
        },
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          id: user._id,
        },
        {
          expiresIn: '1d',
        },
      );

      await this.userService.saveRefreshToken(user._id, refreshToken);

      return {
        message: 'Login has been completed successfully!',
        success: true,
        data: {
          accessToken: `Bearer ${accessToken}`,
          refreshToken: `Bearer ${refreshToken}`,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  async generateRefreshToken(refreshToken: string) {
    try {
      const decoded: MongoidDto = await this.jwtService.verifyAsync(
        refreshToken,
        {
          secret: this.configService.get<string>('HASH_SECRET'),
        },
      );

      if (!decoded) {
        throw new BadRequestException('Invalid refresh token');
      }

      const user = await this.userService.getUser(decoded.id);

      if (!user?.data) {
        throw new BadRequestException('User not found');
      }

      const isRefreshTokenValid =
        user.data.refreshTokens.includes(refreshToken);

      if (!isRefreshTokenValid) {
        throw new BadRequestException('Invalid refresh token');
      }

      const accessToken = await this.jwtService.signAsync(
        {
          id: decoded.id,
        },
        {
          expiresIn: '1m',
        },
      );

      const newRefreshToken = await this.jwtService.signAsync(
        {
          id: decoded.id,
        },
        {
          expiresIn: '3m',
        },
      );

      await this.userService.saveRefreshToken(decoded.id, newRefreshToken);

      return {
        message: 'Refresh token has been generated successfully!',
        success: true,
        data: {
          accessToken: `Bearer ${accessToken}`,
          refreshToken: `Bearer ${newRefreshToken}`,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  }

  logout() {
    return `This action handles logout`;
  }
}
