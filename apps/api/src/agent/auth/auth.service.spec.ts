import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { createTestingModuleFactory } from 'nest-spectator';
import { AgentsService } from '../agents/agents.service';
import { JwtService } from '@nestjs/jwt';
import { TsRestException } from '@ts-rest/nest';
import { contract } from '@properview/api-contract';
import { Agent } from '@prisma/client';
import { JwtToken } from './jwtToken';
import * as argon2 from 'argon2';

// Mock argon2
jest.mock('argon2');
const mockedArgon2 = argon2 as jest.Mocked<typeof argon2>;

describe('AuthService', () => {
  let service: AuthService;
  let agentsService: jest.Mocked<AgentsService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockAgent: Agent = {
    id: 'test-agent-id',
    name: 'Test Agent',
    email: 'test@example.com',
    password: 'hashed-password',
  };

  const mockJwtToken: JwtToken = {
    id: mockAgent.id,
    email: mockAgent.email,
    name: mockAgent.name,
  };

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      providers: [AuthService],
      mocks: [AgentsService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    agentsService = module.get(AgentsService);
    jwtService = module.get(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'test-password',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const expectedToken = 'jwt-token';
      agentsService.retrieveByEmail.mockResolvedValue(mockAgent);
      mockedArgon2.verify.mockResolvedValue(true);
      jwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await service.login(loginInput);

      // Assert
      expect(agentsService.retrieveByEmail).toHaveBeenCalledWith(
        loginInput.email,
      );
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        mockAgent.password,
        loginInput.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith(mockJwtToken, {
        expiresIn: '60d',
      });
      expect(result).toEqual({ token: expectedToken });
    });

    it('should throw TsRestException when user is not found', async () => {
      // Arrange
      agentsService.retrieveByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(TsRestException);
      expect(agentsService.retrieveByEmail).toHaveBeenCalledWith(
        loginInput.email,
      );
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw TsRestException when password is invalid', async () => {
      // Arrange
      agentsService.retrieveByEmail.mockResolvedValue(mockAgent);
      mockedArgon2.verify.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(TsRestException);
      expect(agentsService.retrieveByEmail).toHaveBeenCalledWith(
        loginInput.email,
      );
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        mockAgent.password,
        loginInput.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw TsRestException with correct error details for invalid email', async () => {
      // Arrange
      agentsService.retrieveByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(TsRestException);
      expect(agentsService.retrieveByEmail).toHaveBeenCalledWith(
        loginInput.email,
      );
      expect(mockedArgon2.verify).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw TsRestException with correct error details for invalid password', async () => {
      // Arrange
      agentsService.retrieveByEmail.mockResolvedValue(mockAgent);
      mockedArgon2.verify.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginInput)).rejects.toThrow(TsRestException);
      expect(agentsService.retrieveByEmail).toHaveBeenCalledWith(
        loginInput.email,
      );
      expect(mockedArgon2.verify).toHaveBeenCalledWith(
        mockAgent.password,
        loginInput.password,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    const validToken = 'valid-jwt-token';

    it('should return true for valid token', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(mockJwtToken);
      agentsService.retrieveByIdOrThrow.mockResolvedValue(mockAgent);

      // Act
      const result = await service.validateToken(validToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).toHaveBeenCalledWith(
        mockJwtToken.id,
      );
      expect(result).toBe(true);
    });

    it('should return false when jwt verification fails', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = await service.validateToken(validToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when user is not found', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(mockJwtToken);
      agentsService.retrieveByIdOrThrow.mockImplementation(() => {
        throw new Error('User not found');
      });

      // Act
      const result = await service.validateToken(validToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).toHaveBeenCalledWith(
        mockJwtToken.id,
      );
      expect(result).toBe(false);
    });

    it('should return false when token email does not match user email', async () => {
      // Arrange
      const differentAgent = { ...mockAgent, email: 'different@example.com' };
      jwtService.verify.mockReturnValue(mockJwtToken);
      agentsService.retrieveByIdOrThrow.mockResolvedValue(differentAgent);

      // Act
      const result = await service.validateToken(validToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).toHaveBeenCalledWith(
        mockJwtToken.id,
      );
      expect(result).toBe(false);
    });
  });

  describe('getUserFromToken', () => {
    const validToken = 'valid-jwt-token';

    it('should return user for valid token', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(mockJwtToken);
      agentsService.retrieveByIdOrThrow.mockResolvedValue(mockAgent);

      // Act
      const result = await service.getUserFromToken(validToken);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).toHaveBeenCalledWith(
        mockJwtToken.id,
      );
      expect(result).toBe(mockAgent);
    });

    it('should throw error when jwt verification fails', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.getUserFromToken(validToken)).rejects.toThrow(
        'Invalid token',
      );
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).not.toHaveBeenCalled();
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(mockJwtToken);
      agentsService.retrieveByIdOrThrow.mockImplementation(() => {
        throw new Error('User not found');
      });

      // Act & Assert
      await expect(service.getUserFromToken(validToken)).rejects.toThrow(
        'User not found',
      );
      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(agentsService.retrieveByIdOrThrow).toHaveBeenCalledWith(
        mockJwtToken.id,
      );
    });
  });
});
