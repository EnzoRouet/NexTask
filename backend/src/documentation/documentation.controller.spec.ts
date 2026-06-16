import { Test, TestingModule } from '@nestjs/testing';
import { DocumentationController } from './documentation.controller';
import { DocumentationService } from './documentation.service';
import type { ActiveUser } from '../auth/types/active-user.interface';
import { ProjectRoleGuard } from '../auth/guards/project-role/project-role.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('DocumentationController', () => {
  let controller: DocumentationController;

  const mockDocumentationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentationController],
      providers: [
        {
          provide: DocumentationService,
          useValue: mockDocumentationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ProjectRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentationController>(DocumentationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should successfully pass the DTO and the user ID to the service when creating a document', async () => {
      // Arrange
      const mockUser: ActiveUser = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'USER',
      };
      const createDto = { title: 'Setup Guide', projectId: 'project-456' };
      const expectedCreatedDocument = { id: 'doc-789', ...createDto };

      mockDocumentationService.create.mockResolvedValue(
        expectedCreatedDocument,
      );

      // Act
      const result = await controller.create(createDto, mockUser);

      // Assert
      expect(mockDocumentationService.create).toHaveBeenCalledWith(
        createDto,
        mockUser.id,
      );
      expect(result).toEqual(expectedCreatedDocument);
    });
  });

  describe('findAll', () => {
    it('should retrieve all documents for a specific project based on the project ID and user ID', async () => {
      // Arrange
      const mockUser: ActiveUser = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'USER',
      };
      const mockProjectId = 'project-456';
      const expectedDocumentList = [{ id: 'doc-1', title: 'Doc 1' }];

      mockDocumentationService.findAll.mockResolvedValue(expectedDocumentList);

      // Act
      const result = await controller.findAll(mockProjectId, mockUser);

      // Assert
      expect(mockDocumentationService.findAll).toHaveBeenCalledWith(
        mockProjectId,
        mockUser.id,
      );
      expect(result).toEqual(expectedDocumentList);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single document based on the document ID and user ID', async () => {
      // Arrange
      const mockUser: ActiveUser = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'USER',
      };
      const mockDocumentId = 'doc-789';
      const expectedDocument = { id: mockDocumentId, title: 'Single Doc' };

      mockDocumentationService.findOne.mockResolvedValue(expectedDocument);

      // Act
      const result = await controller.findOne(mockDocumentId, mockUser);

      // Assert
      expect(mockDocumentationService.findOne).toHaveBeenCalledWith(
        mockDocumentId,
        mockUser.id,
      );
      expect(result).toEqual(expectedDocument);
    });
  });

  describe('update', () => {
    it('should successfully pass the document ID, update DTO, and user ID to the service when updating a document', async () => {
      // Arrange
      const mockUser: ActiveUser = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'USER',
      };
      const mockDocumentId = 'doc-789';
      const updateDto = { title: 'Updated Setup Guide' };
      const expectedUpdatedDocument = { id: mockDocumentId, ...updateDto };

      mockDocumentationService.update.mockResolvedValue(
        expectedUpdatedDocument,
      );

      // Act
      const result = await controller.update(
        mockDocumentId,
        updateDto,
        mockUser,
      );

      // Assert
      expect(mockDocumentationService.update).toHaveBeenCalledWith(
        mockDocumentId,
        updateDto,
        mockUser.id,
      );
      expect(result).toEqual(expectedUpdatedDocument);
    });
  });

  describe('remove', () => {
    it('should successfully pass the document ID and user ID to the service when deleting a document', async () => {
      // Arrange
      const mockUser: ActiveUser = {
        id: 'user-123',
        email: 'test@test.com',
        role: 'USER',
      };
      const mockDocumentId = 'doc-789';
      const expectedDeletedDocument = {
        id: mockDocumentId,
        title: 'Deleted Doc',
      };

      mockDocumentationService.remove.mockResolvedValue(
        expectedDeletedDocument,
      );

      // Act
      const result = await controller.remove(mockDocumentId, mockUser);

      // Assert
      expect(mockDocumentationService.remove).toHaveBeenCalledWith(
        mockDocumentId,
        mockUser.id,
      );
      expect(result).toEqual(expectedDeletedDocument);
    });
  });
});
