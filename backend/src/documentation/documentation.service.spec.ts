import { Test, TestingModule } from '@nestjs/testing';
import { DocumentationService } from './documentation.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DocumentationService', () => {
  let service: DocumentationService;

  const mockPrismaService = {
    doc: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deleteFilter: {
      project: {
        findFirst: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentationService>(DocumentationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a document when the user has access to the project', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const createDto = { title: 'My Wiki', projectId: 'project-456' };
      const mockProjectAccess = { id: 'project-456', ownerId: 'user-123' };
      const expectedCreatedDoc = { id: 'doc-789', ...createDto };

      mockPrismaService.deleteFilter.project.findFirst.mockResolvedValue(
        mockProjectAccess,
      );
      mockPrismaService.doc.create.mockResolvedValue(expectedCreatedDoc);

      // Act
      const result = await service.create(createDto, mockUserId);

      // Assert
      expect(
        mockPrismaService.deleteFilter.project.findFirst,
      ).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.doc.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(expectedCreatedDoc);
    });

    it('should throw a ForbiddenException when the user tries to create a document in a project they cannot access', async () => {
      // Arrange
      const mockUserId = 'hacker-123';
      const createDto = { title: 'Hacked Wiki', projectId: 'project-456' };

      mockPrismaService.deleteFilter.project.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrismaService.doc.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the document when it exists and the user has access to the parent project', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const mockDocumentId = 'doc-789';
      const mockDatabaseDocument = {
        id: mockDocumentId,
        projectId: 'project-456',
        title: 'Top Secret',
      };
      const mockProjectAccess = { id: 'project-456' };

      mockPrismaService.doc.findUnique.mockResolvedValue(mockDatabaseDocument);
      mockPrismaService.deleteFilter.project.findFirst.mockResolvedValue(
        mockProjectAccess,
      );

      // Act
      const result = await service.findOne(mockDocumentId, mockUserId);

      // Assert
      expect(mockPrismaService.doc.findUnique).toHaveBeenCalledWith({
        where: { id: mockDocumentId },
      });
      expect(
        mockPrismaService.deleteFilter.project.findFirst,
      ).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDatabaseDocument);
    });

    it('should throw a NotFoundException when the document ID does not exist in the database', async () => {
      // Arrange
      const mockUserId = 'user-123';
      const wrongDocumentId = 'fake-doc-id';

      mockPrismaService.doc.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findOne(wrongDocumentId, mockUserId),
      ).rejects.toThrow(NotFoundException);
      expect(
        mockPrismaService.deleteFilter.project.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('should throw a ForbiddenException when the user requests an existing document from a project they do not belong to', async () => {
      // Arrange
      const mockUserId = 'sneaky-user-123';
      const mockDocumentId = 'doc-789';
      const mockDatabaseDocument = {
        id: mockDocumentId,
        projectId: 'secret-project-456',
      };

      mockPrismaService.doc.findUnique.mockResolvedValue(mockDatabaseDocument);
      mockPrismaService.deleteFilter.project.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(mockDocumentId, mockUserId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
