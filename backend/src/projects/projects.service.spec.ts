import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';

const mockPrismaService = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: typeof mockPrismaService;
  const userId = 'user-123';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a project with default columns and assign the userId as ownerId', async () => {
      // Arrange
      const createDto: CreateProjectDto = { name: 'New Project' };
      const expectedProject = { id: 'uuid-1', ...createDto, ownerId: userId };
      prisma.project.create.mockResolvedValue(expectedProject);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          ownerId: userId,
          columns: {
            create: [
              { name: 'TODO', position: 1000 },
              { name: 'IN_PROGRESS', position: 2000 },
              { name: 'DONE', position: 3000 },
            ],
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return the list of projects where the user is owner or member', async () => {
      // Arrange
      const expectedProjects = [{ id: 'uuid-1', name: 'Test' }];
      prisma.project.findMany.mockResolvedValue(expectedProjects);

      // Act
      const result = await service.findAll(userId);

      // Assert
      expect(result).toEqual(expectedProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a project with its columns and tickets if the user has access', async () => {
      // Arrange
      const id = 'uuid-1';
      const expectedProject = { id, name: 'Test' };
      prisma.project.findFirst.mockResolvedValue(expectedProject);

      // Act
      const result = await service.findOne(id, userId);

      // Assert
      expect(result).toEqual(expectedProject);
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: {
          id: id,
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
        },
        include: {
          columns: {
            include: {
              tickets: {
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
      });
    });

    it('should throw a NotFoundException if the project does not exist or access is denied', async () => {
      // Arrange
      prisma.project.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalid-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the project', async () => {
      // Arrange
      const id = 'uuid-1';
      const updateDto: UpdateProjectDto = { name: 'Modified' };
      const existingProject = { id, name: 'Test', ownerId: userId };
      const updatedProject = { ...existingProject, ...updateDto };

      prisma.project.findFirst.mockResolvedValue(existingProject);
      prisma.project.update.mockResolvedValue(updatedProject);

      // Act
      const result = await service.update(id, userId, updateDto);

      // Assert
      expect(result).toEqual(updatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete the project if the user is the strict owner', async () => {
      // Arrange
      const id = 'uuid-1';
      const existingProject = { id, name: 'Test', ownerId: userId };

      prisma.project.findFirst.mockResolvedValue(existingProject);
      prisma.project.delete.mockResolvedValue(existingProject);

      // Act
      const result = await service.remove(id, userId);

      // Assert
      expect(result).toEqual(existingProject);
      expect(prisma.project.findFirst).toHaveBeenCalledWith({
        where: { id: id, ownerId: userId },
      });
      expect(prisma.project.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw a ForbiddenException if the user tries to delete a project they do not own', async () => {
      // Arrange
      prisma.project.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('uuid-1', userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.project.delete).not.toHaveBeenCalled();
    });
  });
});
