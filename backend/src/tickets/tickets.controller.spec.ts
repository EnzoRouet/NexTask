import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const mockTicketsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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
    it('devrait appeler service.create avec le bon DTO', () => {
      const dto: CreateTicketDto = { title: 'Test', projectId: 'projet-123' };
      const expectedResult = { id: 'uuid-1', ...dto };

      service.create.mockReturnValue(expectedResult);

      const result = controller.create(dto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('devrait appeler service.findAll avec le projectId', () => {
      const projectId = 'projet-123';
      const expectedResult = [{ id: 'uuid-1', title: 'Test' }];

      service.findAll.mockReturnValue(expectedResult);

      const result = controller.findAll(projectId);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(projectId);
    });
  });

  describe('findOne', () => {
    it('devrait appeler service.findOne avec le bon ID', () => {
      const id = 'uuid-1';
      const expectedResult = { id, title: 'Test' };

      service.findOne.mockReturnValue(expectedResult);

      const result = controller.findOne(id);

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('devrait appeler service.update avec ID et DTO', () => {
      const id = 'uuid-1';
      const dto: UpdateTicketDto = { status: 'DONE' };
      const expectedResult = { id, status: 'DONE' };

      service.update.mockReturnValue(expectedResult);

      const result = controller.update(id, dto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('devrait appeler service.remove avec le bon ID', () => {
      const id = 'uuid-1';
      const expectedResult = { id, title: 'Test' };

      service.remove.mockReturnValue(expectedResult);

      const result = controller.remove(id);

      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
