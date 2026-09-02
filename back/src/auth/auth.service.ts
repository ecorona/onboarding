import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { SignInResponseDto } from './dto/sign-in-response.dto.js';
import { JwtService } from '@nestjs/jwt';
import { ProfileResponseDto } from './dto/profile-response.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<SignInResponseDto> {
    const user = await this.usersService.findByEmail(email.toLocaleLowerCase());

    if (
      !user ||
      !user.activo ||
      !(await this.usersService.passwordValido(user.password, pass))
    ) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user.id };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async getProfile(userId: number): Promise<ProfileResponseDto> {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.activo) {
      throw new UnauthorizedException(
        'El usuario de la sesión no está disponible',
      );
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      activo: user.activo,
      emailValidated: user.emailValidated,
    };
  }
}
