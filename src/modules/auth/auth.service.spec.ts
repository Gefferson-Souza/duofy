import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user-response.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserResponse: UserResponseDto = {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      // Corrigido: Usando mockImplementation em vez de spyOn diretamente
      const findOneMock = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(repository, 'findOne').mockImplementation(findOneMock);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(repository.findOne()).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedResult } = mockUser;
      expect(result).toEqual(expectedResult);
    });

    it('should return null when user not found', async () => {
      // Corrigido: Usando mockImplementation em vez de spyOn diretamente
      const findOneMock = jest.fn().mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockImplementation(findOneMock);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      // Corrigido: Usando mockImplementation em vez de spyOn diretamente
      const findOneMock = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(repository, 'findOne').mockImplementation(findOneMock);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return user data and access token', async () => {
      jest.spyOn(service, 'validateUser').mockImplementation(async () => {
        await Promise.resolve();
        return {
          ...mockUserResponse,
          isActive: true,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        };
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(service.validateUser()).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(jwtService.sign()).toHaveBeenCalledWith({
        email: mockUserResponse.email,
        sub: mockUserResponse.id,
        role: mockUserResponse.role,
      });
      expect(result).toEqual({
        user: mockUserResponse,
        access_token: 'token',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockImplementation(async () => {
        await Promise.resolve();
        return null;
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(service.validateUser()).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword',
      );
    });
  });

  describe('register', () => {
    it('should create a new user', async () => {
      // Corrigido: Usando mockImplementation para todos os métodos
      const findOneMock = jest.fn().mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockImplementation(findOneMock);

      const hashSpy = (bcrypt.hash as jest.Mock).mockResolvedValueOnce(
        'hashedPassword',
      );

      const createMock = jest.fn().mockReturnValue(mockUser);
      jest.spyOn(repository, 'create').mockImplementation(createMock);

      const saveMock = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(repository, 'save').mockImplementation(saveMock);

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(repository.findOne()).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(hashSpy).toHaveBeenCalledWith('password123', 10);
      expect(createMock).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
      });
      expect(saveMock).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUserResponse);
    });

    it('should throw ConflictException when email is already in use', async () => {
      // Corrigido: Usando mockImplementation em vez de spyOn diretamente
      const findOneMock = jest.fn().mockResolvedValue(mockUser);
      jest.spyOn(repository, 'findOne').mockImplementation(findOneMock);

      await expect(
        service.register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);

      expect(repository.findOne()).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });
});
