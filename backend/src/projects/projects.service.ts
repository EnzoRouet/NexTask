import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createProjectDto: CreateProjectDto, userId: string) {
    return await this.prisma.project.create({
      data: {
        ...createProjectDto,
        ownerId: userId,
        columns: {
          create: [
            { name: 'TODO', position: 1000 },
            { name: 'IN_PROGRESS', position: 2000 },
            { name: 'DONE', position: 3000 },
          ],
        },
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
    });
  }

  async findOne(id: string, userId: string) {
    const response = await this.prisma.project.findFirst({
      where: {
        id: id,

        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tickets: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });
    if (!response) throw new NotFoundException("Ce projet n'existe pas");
    return response;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id, userId);
    return await this.prisma.project.update({
      where: { id: id },
      data: updateProjectDto,
    });
  }

  async remove(id: string, userId: string) {
    const response = await this.prisma.project.findFirst({
      where: {
        id: id,
        ownerId: userId,
      },
    });

    if (!response) {
      throw new ForbiddenException(
        "Vous n'avez pas le droit de faire cette action",
      );
    }

    return await this.prisma.project.delete({ where: { id: id } });
  }
}
