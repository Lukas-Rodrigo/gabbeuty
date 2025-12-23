import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';

import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-use';
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token.use-case';
import { CreateUserUseCase } from '@/modules/auth/application/use-cases/create-user.use-case';
import { LoginDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { Public } from '../../jwt/public.decorator';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { mapDomainErrorToHttpException } from '@/_shared/filters/map-domain-error';
import { AuthApiDoc } from '@/_shared/docs/swagger.decorators';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Env } from '@/env';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private loginUseCase: LoginUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private logoutUseCase: LogoutUseCase,
    private registerUseCase: CreateUserUseCase,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @AuthApiDoc.Register()
  @Public()
  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    this.logger.log('POST /auth/register - Registration request received');
    const result = await this.registerUseCase.execute(body);

    if (result.isLeft()) {
      const error = mapDomainErrorToHttpException(result.value);
      this.logger.error(
        `POST /auth/register - Registration failed: ${error.message}`,
      );
      throw error;
    }

    this.logger.log(
      `POST /auth/register - User registered successfully: ${result.value.id}`,
    );
    return result.value;
  }

  @AuthApiDoc.Login()
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('POST /auth/login - Login request received');
    const result = await this.loginUseCase.execute(body);

    if (result.isLeft()) {
      const error = mapDomainErrorToHttpException(result.value);
      this.logger.error(`POST /auth/login - Login failed: ${error.message}`);
      throw error;
    }

    const { accessToken, refreshToken } = result.value;

    this.setAuthCookies({
      accessToken,
      refreshToken,
      res,
    });

    this.logger.log('POST /auth/login - Login successful');

    return { message: 'Login successful' };
  }

  @AuthApiDoc.Refresh()
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log('POST /auth/refresh - Refresh token request received');
    const CookieRefreshToken = req.cookies?.refresh_token;

    if (!CookieRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.refreshTokenUseCase.execute({
      refreshToken: CookieRefreshToken,
    });

    if (result.isLeft()) {
      const error = mapDomainErrorToHttpException(result.value);
      this.logger.error(
        `POST /auth/refresh - Token refresh failed: ${error.message}`,
      );
      throw error;
    }

    const { accessToken, refreshToken } = result.value;

    this.setAuthCookies({
      accessToken,
      refreshToken,
      res,
    });

    this.logger.log('POST /auth/refresh - Token refreshed successfully');
    return result.value;
  }

  @AuthApiDoc.Logout()
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() body: RefreshTokenDto) {
    this.logger.log('POST /auth/logout - Logout request received');
    await this.logoutUseCase.execute(body);
    this.logger.log('POST /auth/logout - Logout completed');
  }

  private setAuthCookies({
    accessToken,
    refreshToken,
    res,
  }: {
    refreshToken: string;
    accessToken: string;
    res: Response;
  }) {
    const isProd =
      this.config.get('NODE_ENV', { infer: true }) === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15, // 15 min
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
  }
}
