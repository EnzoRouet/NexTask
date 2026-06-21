import { Test, TestingModule } from '@nestjs/testing';
import { ProjectMembersService } from './project-members.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { ProjectRole } from '@prisma/client';

const mockPrismaService = {
  projectMember: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  deleteFilter: {
    project: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
};

describe('ProjectMembersService', () => {
  let service: ProjectMembersService;
  let prisma: typeof mockPrismaService;

  const projectId = 'projet-123';
  const requesterId = 'owner-123';
  const targetEmail = 'newdev@test.com';
  const targetUserId = 'user-456';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectMembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProjectMembersService>(ProjectMembersService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProjectMemberDto = {
      email: targetEmail,
      role: ProjectRole.DEVELOPER,
    };

    it('should successfully add a new member if requester has rights and user exists', async () => {
      // Arrange
      prisma.deleteFilter.project.findUnique.mockResolvedValue({
        id: projectId,
        ownerId: requesterId,
        members: [],
      });
      prisma.deleteFilter.user.findUnique.mockResolvedValue({
        id: targetUserId,
        email: targetEmail,
      });
      prisma.projectMember.findFirst.mockResolvedValue(null);

      const expectedMember = {
        id: 'member-1',
        projectId,
        userId: targetUserId,
        role: ProjectRole.DEVELOPER,
      };
      prisma.projectMember.create.mockResolvedValue(expectedMember);

      // Act
      const result = await service.create(projectId, createDto, requesterId);

      // Assert
      expect(result).toEqual(expectedMember);
      expect(prisma.projectMember.create).toHaveBeenCalledWith({
        data: { projectId, userId: targetUserId, role: createDto.role },
      });
    });

    it('should throw a NotFoundException if the project does not exist', async () => {
      // Arrange
      prisma.deleteFilter.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(projectId, createDto, requesterId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a ForbiddenException if requester tries to invite a role with higher weight', async () => {
      // Arrange
      const devRequesterId = 'dev-123';
      const devCreateDto: CreateProjectMemberDto = {
        email: targetEmail,
        role: ProjectRole.PO,
      };

      prisma.deleteFilter.project.findUnique.mockResolvedValue({
        id: projectId,
        ownerId: 'someone-else',
        members: [{ userId: devRequesterId, role: ProjectRole.DEVELOPER }],
      });

      // Act & Assert
      await expect(
        service.create(projectId, devCreateDto, devRequesterId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw a NotFoundException if the target user email does not exist in the database', async () => {
      // Arrange
      prisma.deleteFilter.project.findUnique.mockResolvedValue({
        id: projectId,
        ownerId: requesterId,
        members: [],
      });
      prisma.deleteFilter.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.create(projectId, createDto, requesterId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a ConflictException if the target user is already a member of the project', async () => {
      // Arrange
      prisma.deleteFilter.project.findUnique.mockResolvedValue({
        id: projectId,
        ownerId: requesterId,
        members: [],
      });
      prisma.deleteFilter.user.findUnique.mockResolvedValue({
        id: targetUserId,
        email: targetEmail,
      });
      prisma.projectMember.findFirst.mockResolvedValue({
        id: 'existing-member',
      });

      // Act & Assert
      await expect(
        service.create(projectId, createDto, requesterId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an aggregated list of the owner and members', async () => {
      // Arrange
      const mockProject = {
        id: projectId,
        owner: { id: 'owner-1', name: 'Alice' },
      };
      const mockMembers = [
        { id: 'member-1', user: { id: 'user-2', name: 'Bob' } },
      ];

      prisma.deleteFilter.project.findUnique.mockResolvedValue(mockProject);
      prisma.projectMember.findMany.mockResolvedValue(mockMembers);

      // Act
      const result = await service.findAll(projectId);

      // Assert
      expect(result).toEqual([
        {
          id: `owner-${mockProject.owner.id}`,
          role: 'OWNER',
          user: {
            id: mockProject.owner.id,
            name: `${mockProject.owner.name} (Créateur)`,
          },
        },
        ...mockMembers,
      ]);
      expect(prisma.deleteFilter.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
        include: {
          owner: { select: { id: true, name: true } },
        },
      });
    });

    it('should throw a NotFoundException if the project does not exist', async () => {
      // Arrange
      prisma.deleteFilter.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findAll(projectId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully remove a member if requester has higher weight', async () => {
      // Arrange
      const poRequesterId = 'po-123';
      const devTargetId = 'dev-456';

      const projectMock = {
        id: projectId,
        ownerId: 'owner-789',
        members: [{ userId: poRequesterId, role: ProjectRole.PO }],
      };

      const targetMemberMock = {
        id: 'member-999',
        projectId,
        userId: devTargetId,
        role: ProjectRole.DEVELOPER,
      };

      prisma.deleteFilter.project.findUnique.mockResolvedValue(projectMock);
      prisma.projectMember.findFirst.mockResolvedValue(targetMemberMock);
      prisma.projectMember.delete.mockResolvedValue(targetMemberMock);

      // Act
      const result = await service.remove(
        projectId,
        devTargetId,
        poRequesterId,
      );

      // Assert
      expect(result).toEqual(targetMemberMock);
      expect(prisma.projectMember.delete).toHaveBeenCalledWith({
        where: { id: targetMemberMock.id },
      });
    });

    it('should throw ForbiddenException if trying to remove the OWNER', async () => {
      // Arrange
      const poRequesterId = 'po-123';
      const ownerTargetId = 'owner-789';

      const projectMock = {
        id: projectId,
        ownerId: ownerTargetId,
        members: [{ userId: poRequesterId, role: ProjectRole.PO }],
      };

      prisma.deleteFilter.project.findUnique.mockResolvedValue(projectMock);

      // Act & Assert
      await expect(
        service.remove(projectId, ownerTargetId, poRequesterId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if requester weight is equal or lower than target weight', async () => {
      // Arrange
      const devRequesterId = 'dev-123';
      const poTargetId = 'po-456';

      const projectMock = {
        id: projectId,
        ownerId: 'owner-789',
        members: [{ userId: devRequesterId, role: ProjectRole.DEVELOPER }],
      };

      const targetMemberMock = {
        id: 'member-999',
        projectId,
        userId: poTargetId,
        role: ProjectRole.PO,
      };

      prisma.deleteFilter.project.findUnique.mockResolvedValue(projectMock);
      prisma.projectMember.findFirst.mockResolvedValue(targetMemberMock);

      // Act & Assert
      await expect(
        service.remove(projectId, poTargetId, devRequesterId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
