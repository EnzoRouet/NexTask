import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

// On mock le module bcrypt pour pas prendre 3 plombes
jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest
              .fn()
              .mockResolvedValue('faux_token_jwt_pour_le_test'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw a ConflictException if email already exists', async () => {
    // Arrange
    const mockUserArray = {
      id: 1,
      email: 'test@gmail.com',
      name: 'Enzo',
      role: 'USER',
    };

    const createDTO: RegisterDto = {
      email: 'test@gmail.com',
      password: '01234567890',
      name: 'Enzo',
    };

    prisma.user.findUnique.mockResolvedValue(mockUserArray);

    // Act & Assert
    await expect(service.register(createDTO)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should successfully register a new user', async () => {
    // Arrange
    const createDTO: RegisterDto = {
      email: 'test@gmail.com',
      password: '01234567890',
      name: 'Enzo',
    };

    const mockUserObject = {
      id: 1,
      ...createDTO,
      password: 'mot_de_passe_hache',
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...expectedUser } = mockUserObject;

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(expectedUser);
    // On utilise notre mock bcrypt pour un test hash rapide
    (bcrypt.hash as jest.Mock).mockResolvedValue('faux_hash_rapide');

    // Act
    const register = await service.register(createDTO);

    // Assert
    expect(register).toEqual(expectedUser);
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should throw an UnauthorizedException if user does not exist', async () => {
    // Arrange
    const loginDTO: LoginDto = {
      email: 'test@gmail.com',
      password: '01234567890',
    };
    prisma.user.findUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(service.login(loginDTO)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw an UnauthorizedException if user wrote wrong password', async () => {
    // Arrange
    const mockUserArray = {
      id: 1,
      email: 'test@gmail.com',
      name: 'Enzo',
      password: 'mot_de_passe_haché',
    };

    const loginTestDTO: LoginDto = {
      email: 'test@gmail.com',
      password: '01234569283729017',
    };

    prisma.user.findUnique.mockResolvedValue(mockUserArray);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // Act & Assert
    await expect(service.login(loginTestDTO)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should successfuly connect the user', async () => {
    // Arrange
    const mockUserArray = {
      id: 1,
      email: 'test@gmail.com',
      name: 'Enzo',
      password: 'mot_de_passe_haché',
    };

    const loginTestDTO: LoginDto = {
      email: 'test@gmail.com',
      password: '01234567890',
    };

    const expectedPayload = {
      sub: mockUserArray.id,
      email: mockUserArray.email,
    };

    prisma.user.findUnique.mockResolvedValue(mockUserArray);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...expectedUser } = mockUserArray;

    // Act
    const userLoged = await service.login(loginTestDTO);

    // Assert
    expect(userLoged).toEqual({
      user: expectedUser,
      access_token: 'faux_token_jwt_pour_le_test',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(jest.spyOn(jwt, 'signAsync')).toHaveBeenCalledWith(expectedPayload);
  });
});
