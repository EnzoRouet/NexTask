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

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it("devrait créer un ticket si l'utilisateur a accès au projet", async () => {
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

    it("devrait lancer ForbiddenException si l'utilisateur n'a pas accès au projet", async () => {
      // Arrange
      const createDto: CreateTicketDto = {
        title: 'T',
        projectId: 'projet-123',
      };
      prisma.project.findFirst.mockResolvedValue(null);

      // Act & Assert (Spécificité : tester une exception regroupe souvent Act et Assert)
      await expect(service.create(createDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.ticket.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devrait retourner la liste des tickets filtrée par projet et droits', async () => {
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
    it("devrait retourner un ticket si l'ID existe et que l'utilisateur a les droits", async () => {
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

    it("devrait lancer une NotFoundException si le ticket n'existe pas ou accès refusé", async () => {
      // Arrange
      prisma.ticket.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('invalide-id', userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('devrait mettre à jour et retourner le ticket', async () => {
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
    it('devrait supprimer le ticket', async () => {
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
