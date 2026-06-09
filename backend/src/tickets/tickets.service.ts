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

  private async getTicketAndCheckRights(id: string, userId: string) {
    const ticket = await this.findOne(id, userId);

    const isOwner = ticket.project.ownerId === userId;
    const isPO = ticket.project.members[0]?.role === 'PO';

    if (isOwner || isPO) {
      return ticket;
    }

    if (
      ticket.column.isLocked ||
      (ticket.assigneeId && ticket.assigneeId !== userId)
    ) {
      throw new ForbiddenException('Action non autorisée sur ce ticket.');
    }

    return ticket;
  }

  async assign(
    ticketId: string,
    targetUserId: string | null,
    requesterId: string,
  ) {
    const ticket = await this.getTicketAndCheckRights(ticketId, requesterId);

    if (targetUserId) {
      const targetUser = await this.prisma.projectMember.findFirst({
        where: { projectId: ticket.projectId, userId: targetUserId },
      });

      const isTargetOwner = ticket.project.ownerId === targetUserId;

      if (!targetUser && !isTargetOwner) {
        throw new NotFoundException(
          'Cet utilisateur ne fait pas partie du projet',
        );
      }

      const isOwner = ticket.project.ownerId === requesterId;
      const isPO = ticket.project.members[0]?.role === 'PO';

      if (!isOwner && !isPO) {
        if (requesterId !== targetUserId) {
          throw new ForbiddenException(
            "Les développeurs ne peuvent s'assigner que leurs tickets",
          );
        }
      }
    }

    return await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assigneeId: targetUserId },
    });
  }

  async create(createTicketDto: CreateTicketDto, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: createTicketDto.projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
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
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
        },
      },
      include: {
        assignee: { select: { name: true, id: true } },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const response = await this.prisma.ticket.findFirst({
      where: {
        id: id,
        project: {
          OR: [{ ownerId: userId }, { members: { some: { userId: userId } } }],
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

    if (!response) {
      throw new NotFoundException(
        "Ce ticket n'existe pas ou vous n'y avez pas accès",
      );
    }

    return response;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string) {
    await this.getTicketAndCheckRights(id, userId);

    return await this.prisma.ticket.update({
      where: { id: id },
      data: updateTicketDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.getTicketAndCheckRights(id, userId);

    return await this.prisma.ticket.delete({
      where: { id: id },
    });
  }
}
