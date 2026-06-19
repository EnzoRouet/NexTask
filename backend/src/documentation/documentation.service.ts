import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentationDto } from './dto/create-documentation.dto';
import { UpdateDocumentationDto } from './dto/update-documentation.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentationService {
  constructor(private readonly prisma: PrismaService) {}
  private async checkProjectAccess(projectId: string, userId: string) {
    return await this.prisma.deleteFilter.project.findFirst({
      where: {
        id: projectId,
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

  async getProjectId(docId: string): Promise<string | null> {
    const doc = await this.prisma.doc.findUnique({
      where: { id: docId },
      select: { projectId: true },
    });

    return doc?.projectId ?? null;
  }

  async create(createDocumentationDto: CreateDocumentationDto, userId: string) {
    const project = await this.checkProjectAccess(
      createDocumentationDto.projectId,
      userId,
    );

    if (!project) {
      throw new ForbiddenException(
        "Ce projet n'existe pas ou vous n'en êtes pas membre",
      );
    }

    return await this.prisma.doc.create({ data: createDocumentationDto });
  }

  async findAll(projectId: string, userId: string) {
    const project = await this.checkProjectAccess(projectId, userId);

    if (!project) {
      throw new ForbiddenException(
        "Ce projet n'existe pas ou vous n'en êtes pas membre",
      );
    }

    return await this.prisma.doc.findMany({
      where: {
        projectId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const doc = await this.prisma.doc.findUnique({ where: { id: id } });

    if (!doc) {
      throw new NotFoundException("Cette page de documentation n'existe pas");
    }

    const project = await this.checkProjectAccess(doc.projectId, userId);

    if (!project) {
      throw new ForbiddenException(
        "Ce projet n'existe pas ou vous n'en êtes pas membre",
      );
    }
    return doc;
  }

  async update(
    id: string,
    updateDocumentationDto: UpdateDocumentationDto,
    userId: string,
  ) {
    await this.findOne(id, userId);

    return await this.prisma.doc.update({
      where: { id },
      data: updateDocumentationDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return await this.prisma.doc.delete({
      where: { id },
    });
  }
}
