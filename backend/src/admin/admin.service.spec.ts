import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
}));

const mockDate = new Date();
const mockCompleteUser: User = {
  id: '1',
  email: 'test@test.com',
  password: 'old_password_hash',
  name: 'Test',
  role: Role.USER,
  createdAt: mockDate,
  updatedAt: mockDate,
};

const expectedSelectConfig = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Arrange
      mockPrismaService.user.findMany.mockResolvedValue([mockCompleteUser]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: expectedSelectConfig,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockCompleteUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user if it exists', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockCompleteUser);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expectedSelectConfig, // ASSERTION STRICTE
      });
      expect(result).toEqual(mockCompleteUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const action = service.findOne('invalid-id');

      // Assert
      await expect(action).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetUserPassword', () => {
    it('should hash the new password and update the user', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockCompleteUser);
      mockPrismaService.user.update.mockResolvedValue(mockCompleteUser);

      // Act
      const result = await service.resetUserPassword('1', 'newPassword');

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expectedSelectConfig,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashed_password_123' },
        select: expectedSelectConfig,
      });
      expect(result).toEqual(mockCompleteUser);
    });
  });

  describe('updateUserRole', () => {
    it('should update the user role', async () => {
      // Arrange
      const updatedUser: User = { ...mockCompleteUser, role: Role.ADMIN };
      mockPrismaService.user.findUnique.mockResolvedValue(mockCompleteUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUserRole('1', Role.ADMIN);

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { role: Role.ADMIN },
        select: expectedSelectConfig,
      });
      expect(result).toEqual(updatedUser);
    });
  });
});
