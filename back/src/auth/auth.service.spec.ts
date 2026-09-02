import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findByEmail: jest.fn(),
    passwordValido: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns a token for an active user with valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 7,
      nombre: 'Usuario real',
      email: 'user@example.com',
      password: 'hash',
      activo: true,
    });
    usersService.passwordValido.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('signed-token');

    await expect(
      service.signIn('USER@example.com', 'password'),
    ).resolves.toEqual({
      accessToken: 'signed-token',
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      email: 'user@example.com',
      sub: 7,
    });
  });

  it('rejects an inactive user', async () => {
    usersService.findByEmail.mockResolvedValue({ activo: false });

    await expect(
      service.signIn('user@example.com', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(usersService.passwordValido).not.toHaveBeenCalled();
  });

  it('returns only safe profile fields for the authenticated user', async () => {
    usersService.findOne.mockResolvedValue({
      id: 7,
      nombre: 'Usuario real',
      email: 'user@example.com',
      password: 'must-not-be-returned',
      activo: true,
      emailValidated: true,
      emailValidationToken: 'must-not-be-returned',
    });

    await expect(service.getProfile(7)).resolves.toEqual({
      id: 7,
      nombre: 'Usuario real',
      email: 'user@example.com',
      activo: true,
      emailValidated: true,
    });
  });
});
