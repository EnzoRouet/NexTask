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
  projectMember: {
    findFirst: jest.fn(),
  },
  boardColumn: {
    findUnique: jest.fn(),
  },
};

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: typeof mockPrismaService;
  const userId = 'user-123';

  // Arrange
  const mockTicketWithRelations = {
    id: 'uuid-1',
    title: 'Test',
    projectId: 'projet-123',
    columnId: 'col-1',
    position: 1000,
    assigneeId: null,
    column: { isLocked: false },
    project: {
      ownerId: userId,
      members: [],
    },
  };

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
    it('should create a ticket with position 1000 if it is the first one', async () => {
      // Arrange
      const createDto: CreateTicketDto = {
        title: 'Nouveau ticket',
        projectId: 'projet-123',
        columnId: 'col-1',
      };
      const expectedTicket = {
        id: 'uuid-1',
        ...createDto,
        position: 1000,
      };
      prisma.project.findFirst.mockResolvedValue({ id: 'projet-123' });
      prisma.ticket.findFirst.mockResolvedValue(null);
      prisma.ticket.create.mockResolvedValue(expectedTicket);

      // Act
      const result = await service.create(createDto, userId);

      // Assert
      expect(result).toEqual(expectedTicket);
      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: { ...createDto, position: 1000 },
      });
    });

    it('should throw a ForbiddenException if the user does not have access to the project', async () => {
      // Arrange
      const createDto: CreateTicketDto = {
        title: 'T',
        projectId: 'projet-123',
        columnId: 'col-1',
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
    it('should return the list of tickets with assignee data included', async () => {
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
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
        },
        include: {
          assignee: { select: { name: true, id: true } },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a ticket with its relations if the user has permissions', async () => {
      // Arrange
      const id = 'uuid-1';
      prisma.ticket.findFirst.mockResolvedValue(mockTicketWithRelations);

      // Act
      const result = await service.findOne(id, userId);

      // Assert
      expect(result).toEqual(mockTicketWithRelations);
      expect(prisma.ticket.findFirst).toHaveBeenCalledWith({
        where: {
          id: id,
          project: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } },
            ],
          },
        },
        include: {
          column: true,
          project: {
            include: {
              members: {
                where: { userId: userId },
              },
            },
          },
        },
      });
    });

    it('should throw a NotFoundException if the ticket does not exist', async () => {
      // Arrange
      prisma.ticket.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalide-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the ticket if the user has rights', async () => {
      // Arrange
      const id = 'uuid-1';
      const updateDto: UpdateTicketDto = { columnId: 'col-2', position: 2500 };
      const updatedTicket = { ...mockTicketWithRelations, ...updateDto };

      prisma.ticket.findFirst.mockResolvedValue(mockTicketWithRelations);
      prisma.boardColumn.findUnique.mockResolvedValue({
        id: 'col-2',
        isLocked: false,
      });
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
    it('should delete the ticket if the user has rights', async () => {
      // Arrange
      const id = 'uuid-1';
      prisma.ticket.findFirst.mockResolvedValue(mockTicketWithRelations);
      prisma.ticket.delete.mockResolvedValue(mockTicketWithRelations);

      // Act
      const result = await service.remove(id, userId);

      // Assert
      expect(result).toEqual(mockTicketWithRelations);
      expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('assign', () => {
    it('should update the assigneeId if the user is authorized', async () => {
      // Arrange
      const ticketId = 'uuid-1';
      const targetUserId = 'user-456';

      prisma.ticket.findFirst.mockResolvedValue(mockTicketWithRelations);
      prisma.projectMember.findFirst.mockResolvedValue({
        id: 'member-1',
        userId: targetUserId,
      });
      prisma.ticket.update.mockResolvedValue({
        ...mockTicketWithRelations,
        assigneeId: targetUserId,
      });

      // Act
      const result = await service.assign(ticketId, targetUserId, userId);

      // Assert
      expect(result.assigneeId).toEqual(targetUserId);
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: ticketId },
        data: { assigneeId: targetUserId },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });
});
