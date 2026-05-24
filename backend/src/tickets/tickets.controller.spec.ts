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

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('devrait appeler service.create avec le bon DTO et le userId', () => {
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
    it('devrait appeler service.findAll avec le projectId et userId', () => {
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
    it('devrait appeler service.findOne avec le bon ID et userId', () => {
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
    it('devrait appeler service.update avec ID, DTO et userId', () => {
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
    it('devrait appeler service.remove avec le bon ID et userId', () => {
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
