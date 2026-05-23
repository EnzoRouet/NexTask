import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

const mockPrismaService = {
  ticket: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: typeof mockPrismaService;

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
    it('devrait créer un nouveau ticket', async () => {
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

      prisma.ticket.create.mockResolvedValue(expectedTicket);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedTicket);
      expect(prisma.ticket.create).toHaveBeenCalledWith({ data: createDto });
    });
  });

  describe('findAll', () => {
    it('devrait retourner la liste des tickets filtrée par projet', async () => {
      const projectId = 'projet-123';
      const expectedTickets = [{ id: 'uuid-1', title: 'Test', projectId }];

      prisma.ticket.findMany.mockResolvedValue(expectedTickets);

      const result = await service.findAll(projectId);

      expect(result).toEqual(expectedTickets);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        where: { projectId },
      });
    });
  });

  describe('findOne', () => {
    it("devrait retourner un ticket si l'ID existe", async () => {
      const id = 'uuid-1';
      const expectedTicket = { id, title: 'Test' };

      prisma.ticket.findUnique.mockResolvedValue(expectedTicket);

      const result = await service.findOne(id);

      expect(result).toEqual(expectedTicket);
      expect(prisma.ticket.findUnique).toHaveBeenCalledWith({ where: { id } });
    });

    it("devrait lancer une NotFoundException si le ticket n'existe pas", async () => {
      prisma.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalide-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('devrait mettre à jour et retourner le ticket', async () => {
      const id = 'uuid-1';
      const updateDto: UpdateTicketDto = { status: 'IN_PROGRESS' };
      const existingTicket = { id, title: 'Test', status: 'TODO' };
      const updatedTicket = { ...existingTicket, ...updateDto };

      // On mock le findUnique (appelé en interne par this.findOne)
      prisma.ticket.findUnique.mockResolvedValue(existingTicket);
      prisma.ticket.update.mockResolvedValue(updatedTicket);

      const result = await service.update(id, updateDto);

      expect(result).toEqual(updatedTicket);
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('devrait supprimer le ticket', async () => {
      const id = 'uuid-1';
      const existingTicket = { id, title: 'Test' };

      prisma.ticket.findUnique.mockResolvedValue(existingTicket);
      prisma.ticket.delete.mockResolvedValue(existingTicket);

      const result = await service.remove(id);

      expect(result).toEqual(existingTicket);
      expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
