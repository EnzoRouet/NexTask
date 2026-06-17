import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersController } from './project-members.controller';
import { ProjectMembersService } from './project-members.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateProjectMemberDto } from './dto/create-project-member.dto';
import type { ActiveUser } from '../auth/types/active-user.interface';
import { ProjectRole } from '@prisma/client';

const mockProjectMembersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  updateRole: jest.fn(),
  remove: jest.fn(),
};

describe('ProjectMembersController', () => {
  let controller: ProjectMembersController;
  let service: typeof mockProjectMembersService;

  const mockUser: ActiveUser = {
    id: 'user-123',
    email: 'test@coda.fr',
    role: 'USER',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectMembersController],
      providers: [
        {
          provide: ProjectMembersService,
          useValue: mockProjectMembersService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProjectMembersController>(ProjectMembersController);
    service = module.get(ProjectMembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the create method of the service with projectId, DTO, and requesterId', async () => {
      // Arrange
      const projectId = 'proj-1';
      const createDto: CreateProjectMemberDto = {
        email: 'dev@test.com',
        role: ProjectRole.DEVELOPER,
      };
      const expectedResult = {
        id: 'member-1',
        projectId,
        userId: 'dev-1',
        role: 'DEVELOPER',
      };
      service.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto, projectId, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(
        projectId,
        createDto,
        mockUser.id,
      );
    });
  });

  describe('findAll', () => {
    it('should call the findAll method of the service with the given projectId', async () => {
      // Arrange
      const projectId = 'proj-1';
      const expectedResult = [{ id: 'member-1' }, { id: 'member-2' }];
      service.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(projectId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(projectId);
    });
  });

  describe('updateRole', () => {
    it('should call the updateRole method of the service', async () => {
      // Arrange
      const projectId = 'proj-1';
      const targetUserId = 'target-456';
      const updateDto = { role: ProjectRole.PO };
      const expectedResult = { id: 'member-1', role: 'PO' };
      service.updateRole.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.updateRole(
        projectId,
        targetUserId,
        updateDto,
        mockUser,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.updateRole).toHaveBeenCalledWith(
        projectId,
        targetUserId,
        updateDto.role,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should call the remove method of the service', async () => {
      // Arrange
      const projectId = 'proj-123';
      const targetUserId = 'target-456';
      const expectedResult = {
        id: 'member-1',
        projectId,
        userId: targetUserId,
        role: 'DEVELOPER',
      };
      service.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(projectId, targetUserId, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(
        projectId,
        targetUserId,
        mockUser.id,
      );
    });
  });
});
