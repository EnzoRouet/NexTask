import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import type { CreateProjectDto } from './dto/create-project.dto';
import type { UpdateProjectDto } from './dto/update-project.dto';
import type { ActiveUser } from '../auth/types/active-user.interface';

const mockProjectsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser: ActiveUser = {
  id: 'user-123',
  email: 'test@entreprise.com',
};

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: typeof mockProjectsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call projectsService.create with the correct DTO and userId', () => {
      // Arrange
      const dto: CreateProjectDto = {
        name: 'New Project',
        description: 'A description',
      };
      const expectedResult = { id: 'uuid-1', ...dto, ownerId: mockUser.id };
      service.create.mockReturnValue(expectedResult);

      // Act
      const result = controller.create(dto, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should call projectsService.findAll with the userId', () => {
      // Arrange
      const expectedResult = [{ id: 'uuid-1', name: 'Test Project' }];
      service.findAll.mockReturnValue(expectedResult);

      // Act
      const result = controller.findAll(mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should call projectsService.findOne with the correct ID and userId', () => {
      // Arrange
      const id = 'uuid-1';
      const expectedResult = { id, name: 'Test Project' };
      service.findOne.mockReturnValue(expectedResult);

      // Act
      const result = controller.findOne(id, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id, mockUser.id);
    });
  });

  describe('update', () => {
    it('should call projectsService.update with ID, DTO and userId', () => {
      // Arrange
      const id = 'uuid-1';
      const dto: UpdateProjectDto = { name: 'Updated Project' };
      const expectedResult = { id, name: 'Updated Project' };
      service.update.mockReturnValue(expectedResult);

      // Act
      const result = controller.update(id, dto, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, mockUser.id, dto);
    });
  });

  describe('remove', () => {
    it('should call projectsService.remove with the correct ID and userId', () => {
      // Arrange
      const id = 'uuid-1';
      const expectedResult = { id, name: 'Deleted Project' };
      service.remove.mockReturnValue(expectedResult);

      // Act
      const result = controller.remove(id, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id, mockUser.id);
    });
  });
});
