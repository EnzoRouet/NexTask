import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(projectId: string, createColumnDto: CreateColumnDto) {
    const column = await this.prisma.boardColumn.findFirst({
      where: { projectId: projectId },
      orderBy: { position: 'desc' },
    });

    const newPosition = (column?.position ?? 0) + 1000;

    return await this.prisma.boardColumn.create({
      data: { ...createColumnDto, position: newPosition, projectId },
    });
  }

  async update(id: string, updateColumnDto: UpdateColumnDto) {
    return await this.prisma.boardColumn.update({
      where: { id: id },
      data: updateColumnDto,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.boardColumn.delete({
        where: { id: id },
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2003') {
        throw new BadRequestException("La colonne n'est pas vide !");
      }
      console.error(error);
      throw error;
    }
  }
}
