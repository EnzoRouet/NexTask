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
  deletedAt: null,
};

const expectedSelectConfig = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  deletedAt: true,
};

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: {
      update: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    projectMember: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    deleteFilter: {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
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
      mockPrismaService.deleteFilter.user.findMany.mockResolvedValue([
        mockCompleteUser,
      ]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockPrismaService.deleteFilter.user.findMany).toHaveBeenCalledWith(
        {
          select: expectedSelectConfig,
          orderBy: { createdAt: 'desc' },
        },
      );
      expect(result).toEqual([mockCompleteUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user if it exists', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        mockCompleteUser,
      );

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(
        mockPrismaService.deleteFilter.user.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expectedSelectConfig,
      });
      expect(result).toEqual(mockCompleteUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetUserPassword', () => {
    it('should hash the new password and update the user', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        mockCompleteUser,
      );
      mockPrismaService.user.update.mockResolvedValue(mockCompleteUser);

      // Act
      const result = await service.resetUserPassword('1', 'newPassword');

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashed_password_123' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(mockCompleteUser);
    });
  });

  describe('updateUserRole', () => {
    it('should update the user role', async () => {
      // Arrange
      const updatedUser: User = { ...mockCompleteUser, role: Role.ADMIN };
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        mockCompleteUser,
      );
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateUserRole('1', Role.ADMIN);

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { role: Role.ADMIN },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('removeUser', () => {
    it('should obfuscate email and apply soft delete when user exists', async () => {
      // Arrange
      const fixedDate = new Date('2026-06-21T12:00:00Z');
      jest.useFakeTimers().setSystemTime(fixedDate);

      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue(
        mockCompleteUser,
      );
      mockPrismaService.user.update.mockResolvedValue({
        ...mockCompleteUser,
        deletedAt: fixedDate,
      });

      // Act
      await service.removeUser('1');

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          deletedAt: fixedDate,
          email: `deleted_${fixedDate.getTime()}_test@test.com`,
        },
      });

      jest.useRealTimers();
    });

    it('should throw NotFoundException if user is already deleted', async () => {
      // Arrange
      mockPrismaService.deleteFilter.user.findUnique.mockResolvedValue({
        ...mockCompleteUser,
        deletedAt: new Date(),
      });

      // Act & Assert
      await expect(service.removeUser('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllProjects', () => {
    it('should return all projects including soft deleted ones', async () => {
      // Arrange
      const mockProjects = [{ id: 'proj-1', name: 'Project 1' }];
      mockPrismaService.project.findMany.mockResolvedValue(mockProjects);

      // Act
      const result = await service.findAllProjects();

      // Assert
      expect(mockPrismaService.project.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });
  });

  describe('investigateProject', () => {
    it('should add admin as PO if they are not already a member', async () => {
      // Arrange
      const mockProject = { id: 'proj-1', ownerId: 'user-2' };
      mockPrismaService.deleteFilter.project.findUnique.mockResolvedValue(
        mockProject,
      );
      mockPrismaService.projectMember.findFirst.mockResolvedValue(null);

      // Act
      const result = await service.investigateProject('proj-1', 'admin-1');

      // Assert
      expect(mockPrismaService.projectMember.create).toHaveBeenCalledWith({
        data: { projectId: 'proj-1', userId: 'admin-1', role: 'PO' },
      });
      expect(result).toHaveProperty('message');
    });

    it('should return a message if admin is already the owner', async () => {
      // Arrange
      const mockProject = { id: 'proj-1', ownerId: 'admin-1' };
      mockPrismaService.deleteFilter.project.findUnique.mockResolvedValue(
        mockProject,
      );

      // Act
      const result = await service.investigateProject('proj-1', 'admin-1');

      // Assert
      expect(result).toEqual({
        message: 'Vous êtes déjà le propriétaire de ce projet.',
      });
    });
  });

  describe('suspendProject', () => {
    it('should soft delete the project', async () => {
      // Arrange
      const fixedDate = new Date('2026-06-21T12:00:00Z');
      jest.useFakeTimers().setSystemTime(fixedDate);

      const mockProject = { id: 'proj-1' };
      mockPrismaService.deleteFilter.project.findUnique.mockResolvedValue(
        mockProject,
      );

      // Act
      await service.suspendProject('proj-1');

      // Assert
      expect(mockPrismaService.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: { deletedAt: fixedDate },
      });

      jest.useRealTimers();
    });

    it('should throw NotFoundException if project does not exist', async () => {
      // Arrange
      mockPrismaService.deleteFilter.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.suspendProject('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
