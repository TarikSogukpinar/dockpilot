import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { TokenService } from '../core/token/token.service';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { HashingService } from 'src/utils/hashing/hashing.service';
import { RegisterUserDto } from './dto/requests/registerUser.dto';
import { RegisterResponseDto } from './dto/responses/registerResponse.dto';
import { LoginUserDto } from './dto/requests/loginUser.dto';
import { LoginResponseDto } from './dto/responses/loginResponse.dto';
import { LogoutResponseDto } from './dto/responses/logoutResponse.dto';
import {
  EmailNotFoundException,
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from 'src/core/handler/exceptions/custom-exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUserService(
    registerUserDto: RegisterUserDto,
  ): Promise<RegisterResponseDto> {
    try {
      const { name, email, password } = registerUserDto;

      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) throw new UserAlreadyExistsException();

      const hashedPassword = await this.hashingService.hashPassword(password);

      const user = await this.prismaService.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          role: 'USER',
        },
      });

      return { uuid: user.uuid, email: user.email, role: user.role };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating ticket',
      );
    }
  }

  async loginUserService(
    loginUserDto: LoginUserDto,
    req: Request,
  ): Promise<LoginResponseDto> {
    try {
      const { email, password } = loginUserDto;

      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) throw new UserNotFoundException();

      const isPasswordValid = await this.hashingService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) throw new InvalidCredentialsException();

      const accessToken = await this.tokenService.createAccessToken(user);
      const refreshToken = await this.tokenService.createRefreshToken(user);

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { accessToken: accessToken },
      });

      return {
        accessToken,
        refreshToken,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating ticket',
      );
    }
  }

  async logoutUserService(
    userId: number,
    token: string,
  ): Promise<LogoutResponseDto> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new UserNotFoundException();

      await this.prismaService.user.update({
        where: { id: userId },
        data: { accessToken: null, refreshToken: null },
      });

      await this.tokenService.blacklistToken(token);

      return { message: 'Logout successful' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating ticket',
      );
    }
  }

  async refreshTokenService(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const accessToken =
        await this.tokenService.refreshAccessToken(refreshToken);
      return { accessToken };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred, please try again later',
      );
    }
  }

  async validateOAuthLoginEmail(
    email: string,
    provider: string,
  ): Promise<User> {
    try {
      let user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await this.prismaService.user.create({
          data: {
            email,
            password: '',
            role: 'USER',
          },
        });
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating ticket',
      );
    }
  }

  async validateOAuthLogin(profile: {
    email: string;
    provider: string;
  }): Promise<string> {
    try {
      const { email, provider } = profile;

      if (!email) throw new EmailNotFoundException();

      const user = await this.validateOAuthLoginEmail(email, provider);

      const payload = { email: user.email, sub: user.id, role: user.role };
      return this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating ticket',
      );
    }
  }
}
