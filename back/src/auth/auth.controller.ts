import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { SignInResponseDto } from './dto/sign-in-response.dto.js';
import { ProfileResponseDto } from './dto/profile-response.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Req() request: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return await this.authService.getProfile(request.user.sub);
  }
}
