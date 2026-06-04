import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: createTicketDto.projectId,
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
    });

    if (!project) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à ce projet pour y créer un ticket",
      );
    }

    const lastTicket = await this.prisma.ticket.findFirst({
      where: {
        columnId: createTicketDto.columnId,
      },
      orderBy: {
        position: 'desc',
      },
    });

    const newPosition = lastTicket ? lastTicket.position + 1000 : 1000;

    return await this.prisma.ticket.create({
      data: { ...createTicketDto, position: newPosition },
    });
  }

  async findAll(projectId: string, userId: string) {
    return await this.prisma.ticket.findMany({
      where: {
        projectId: projectId,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const response = await this.prisma.ticket.findFirst({
      where: {
        id: id,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
        },
      },
    });

    if (!response) {
      throw new NotFoundException(
        "Ce ticket n'existe pas ou vous n'y avez pas accès",
      );
    }

    return response;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string) {
    await this.findOne(id, userId);

    return await this.prisma.ticket.update({
      where: { id: id },
      data: updateTicketDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return await this.prisma.ticket.delete({
      where: { id: id },
    });
  }
}
