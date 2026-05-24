import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const mockPrismaService = {
  ticket: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    findFirst: jest.fn(),
  },
};

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: typeof mockPrismaService;
  const userId = 'user-123';

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket if the user has access to the project', async () => {
      // Arrange
      const createDto: CreateTicketDto = {
        title: 'Nouveau ticket',
        projectId: 'projet-123',
      };
      const expectedTicket = {
        id: 'uuid-1',
        ...createDto,
        status: 'TODO',
        priority: 'MEDIUM',
      };
      prisma.project.findFirst.mockResolvedValue({ id: 'projet-123' });
      prisma.ticket.create.mockResolvedValue(expectedTicket);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(expectedTicket);
      expect(prisma.ticket.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should throw a ForbiddenException if the user does not have access to the project', async () => {
      // Arrange
      const createDto: CreateTicketDto = {
        title: 'T',
        projectId: 'projet-123',
      };
      prisma.project.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.ticket.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return the list of tickets filtered by project and permissions', async () => {
      // Arrange
      const projectId = 'projet-123';
      const expectedTickets = [{ id: 'uuid-1', title: 'Test', projectId }];
      prisma.ticket.findMany.mockResolvedValue(expectedTickets);

      // Act
      const result = await service.findAll(projectId, userId);

      // Assert
      expect(result).toEqual(expectedTickets);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: {
          projectId: projectId,
          project: {
            OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a ticket if the ID exists and the user has permissions', async () => {
      // Arrange
      const id = 'uuid-1';
      const expectedTicket = { id, title: 'Test' };
      prisma.ticket.findFirst.mockResolvedValue(expectedTicket);

      // Act
      const result = await service.findOne(id, userId);

      // Assert
      expect(result).toEqual(expectedTicket);
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          id: id,
          project: {
            OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
          },
        },
      });
    });

    it('should throw a NotFoundException if the ticket does not exist or access is denied', async () => {
      // Arrange
      prisma.ticket.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalide-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the ticket', async () => {
      // Arrange
      const id = 'uuid-1';
      const updateDto: UpdateTicketDto = { status: 'IN_PROGRESS' };
      const existingTicket = { id, title: 'Test', status: 'TODO' };
      const updatedTicket = { ...existingTicket, ...updateDto };
      prisma.ticket.findFirst.mockResolvedValue(existingTicket);
      prisma.ticket.update.mockResolvedValue(updatedTicket);

      // Act
      const result = await service.update(id, updateDto, userId);

      // Assert
      expect(result).toEqual(updatedTicket);
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete the ticket', async () => {
      // Arrange
      const id = 'uuid-1';
      const existingTicket = { id, title: 'Test' };
      prisma.ticket.findFirst.mockResolvedValue(existingTicket);
      prisma.ticket.delete.mockResolvedValue(existingTicket);

      // Act
      const result = await service.remove(id, userId);

      // Assert
      expect(result).toEqual(existingTicket);
      expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
