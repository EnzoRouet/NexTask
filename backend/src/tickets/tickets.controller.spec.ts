import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ActiveUser } from '../auth/types/active-user.interface';

const mockTicketsService = {
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

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: typeof mockTicketsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with the correct DTO and userId', () => {
      // Arrange
      const dto: CreateTicketDto = { title: 'Test', projectId: 'projet-123' };
      const expectedResult = { id: 'uuid-1', ...dto };
      service.create.mockReturnValue(expectedResult);

      // Act
      const result = controller.create(dto, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with the projectId and userId', () => {
      // Arrange
      const projectId = 'projet-123';
      const expectedResult = [{ id: 'uuid-1', title: 'Test' }];
      service.findAll.mockReturnValue(expectedResult);

      // Act
      const result = controller.findAll(projectId, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(projectId, mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with the correct ID and userId', () => {
      // Arrange
      const id = 'uuid-1';
      const expectedResult = { id, title: 'Test' };
      service.findOne.mockReturnValue(expectedResult);

      // Act
      const result = controller.findOne(id, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id, mockUser.id);
    });
  });

  describe('update', () => {
    it('should call service.update with ID, DTO and userId', () => {
      // Arrange
      const id = 'uuid-1';
      const dto: UpdateTicketDto = { status: 'DONE' };
      const expectedResult = { id, status: 'DONE' };
      service.update.mockReturnValue(expectedResult);

      // Act
      const result = controller.update(id, dto, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, dto, mockUser.id);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct ID and userId', () => {
      // Arrange
      const id = 'uuid-1';
      const expectedResult = { id, title: 'Test' };
      service.remove.mockReturnValue(expectedResult);

      // Act
      const result = controller.remove(id, mockUser);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id, mockUser.id);
    });
  });
});
