import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const jwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: JwtService, useValue: jwtService }],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('attaches the verified payload to the request', async () => {
    const request = { headers: { authorization: 'Bearer valid-token' } };
    jwtService.verifyAsync.mockResolvedValue({
      sub: 7,
      email: 'user@example.com',
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request).toHaveProperty('user', {
      sub: 7,
      email: 'user@example.com',
    });
  });

  it('rejects requests without a bearer token', async () => {
    const request = { headers: {} };

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an invalid or expired token', async () => {
    const request = { headers: { authorization: 'Bearer expired-token' } };
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(
      guard.canActivate(createContext(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

function createContext(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
