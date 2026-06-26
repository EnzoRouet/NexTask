import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  deleteFilter: {
    user: {
      findUnique: jest.fn(),
    },
  },
};

describe('UserService', () => {
  let service: UserService;

  const mockUserId = 'uuid-123';
  const mockDate = new Date('2026-06-26T12:00:00Z');
  const mockUser = {
    id: mockUserId,
    email: 'test@nextask.pro',
    name: 'Enzo Rouet',
    password: 'hashedPassword123',
    createdAt: mockDate,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user without sensitive data if found', async () => {
      // Arrange
      const expectedUser = {
        id: mockUserId,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
      };
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        expectedUser,
      );

      // Act
      const result = await service.findOne(mockUserId);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(
        mockPrismaService.deleteFilter.user.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: { id: true, email: true, name: true, createdAt: true },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = { name: 'New Name' };

    it('should update and return the user profile', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        mockUser,
      );
      const updatedUser = {
        id: mockUserId,
        email: mockUser.email,
        name: 'New Name',
        createdAt: mockUser.createdAt,
      };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(mockUserId, updateDto);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: updateDto,
        select: { id: true, email: true, name: true, createdAt: true },
      });
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(mockUserId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete the user and return data without password', async () => {
      // Arrange
      const fixedDate = new Date('2026-06-26T12:00:00Z');
      jest.useFakeTimers().setSystemTime(fixedDate);

      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        mockUser,
      );
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        deletedAt: fixedDate,
      });

      // Act
      const result = await service.remove(mockUserId);

      // Assert
      expect(result.id).toEqual(mockUserId);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { deletedAt: fixedDate },
      });

      // Cleanup
      jest.useRealTimers();
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePassword', () => {
    const passwordDto = {
      oldPassword: 'oldPassword123!',
      newPassword: 'newPassword123!',
      confirmPassword: 'newPassword123!',
    };

    it('should update password and return success message if old password matches', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      // Act
      const result = await service.updatePassword(mockUserId, passwordDto);

      // Assert
      expect(result).toEqual({
        message: 'Mot de passe mis à jour avec succès.',
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        passwordDto.oldPassword,
        mockUser.password,
      );
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { password: 'newHashedPassword' },
      });
    });

    it('should throw ForbiddenException if old password does not match', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.updatePassword(mockUserId, passwordDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updatePassword(mockUserId, passwordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
