import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { jest } from '@jest/globals';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface.js';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    signIn: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('loads the profile using the user id from the validated token', async () => {
    const profile = {
      id: 7,
      nombre: 'Usuario real',
      email: 'user@example.com',
      activo: true,
      emailValidated: true,
    };
    authService.getProfile.mockResolvedValue(profile);
    const request = {
      user: { sub: 7, email: 'user@example.com' },
    } as AuthenticatedRequest;

    await expect(controller.getProfile(request)).resolves.toEqual(profile);
    expect(authService.getProfile).toHaveBeenCalledWith(7);
  });
});
