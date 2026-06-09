import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsController } from './columns.controller';
import { ColumnsService } from './columns.service';
import type { CreateColumnDto } from './dto/create-column.dto';
import type { UpdateColumnDto } from './dto/update-column.dto';

const mockColumnsService = {
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ColumnsController', () => {
  let controller: ColumnsController;
  let service: typeof mockColumnsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColumnsController],
      providers: [
        {
          provide: ColumnsService,
          useValue: mockColumnsService,
        },
      ],
    }).compile();

    controller = module.get<ColumnsController>(ColumnsController);
    service = module.get(ColumnsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the create method of the service with the correct DTO', async () => {
      // Arrange
      const createDto: CreateColumnDto = { name: 'TODO', projectId: 'proj-1' };
      const expectedResult = { id: 'col-1', ...createDto, position: 1000 };
      service.create.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should call the update method of the service with the given ID and DTO', async () => {
      // Arrange
      const id = 'col-1';
      const updateDto: UpdateColumnDto = { name: 'IN_PROGRESS' };
      const expectedResult = { id, name: 'IN_PROGRESS', position: 1000 };
      service.update.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('remove', () => {
    it('should call the remove method of the service with the given ID', async () => {
      // Arrange
      const id = 'col-1';
      const expectedResult = { id, name: 'DONE', position: 3000 };
      service.remove.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.remove(id);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
