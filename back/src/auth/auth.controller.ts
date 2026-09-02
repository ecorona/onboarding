import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignInResponseDto } from './dto/sign-in-response.dto.js';
import { ProfileResponseDto } from './dto/profile-response.dto.js';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface.js';
import { Public } from './decorators/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Public()
  signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Get('profile')
  async getProfile(
    @Req() request: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return await this.authService.getProfile(request.user.sub);
  }
}
