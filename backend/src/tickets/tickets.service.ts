import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto) {
    const response = await this.prisma.ticket.create({
      data: createTicketDto,
    });
    return response;
  }

  async findAll(projectId: string) {
    return await this.prisma.ticket.findMany({
      where: { projectId },
    });
  }

  async findOne(id: string) {
    const response = await this.prisma.ticket.findUnique({ where: { id: id } });
    if (!response) throw new NotFoundException("Cette ticket n'existe pas");
    return response;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    await this.findOne(id);
    return await this.prisma.ticket.update({
      where: { id: id },
      data: updateTicketDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.ticket.delete({
      where: {
        id: id,
      },
    });
  }
}
