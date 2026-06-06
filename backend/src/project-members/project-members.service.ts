import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectMembersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(
    projectId: string,
    createProjectMemberDto: CreateProjectMemberDto,
    requesterId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: requesterId },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    const isOwner = requesterId === project.ownerId;
    const isPO = 'PO' === project.members[0]?.role;

    if (!isOwner && !isPO) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à faire cette action",
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: {
        email: createProjectMemberDto.email,
      },
    });

    if (!targetUser) {
      throw new NotFoundException("Cet utilisateur n'existe pas");
    }

    const existingMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: targetUser.id,
      },
    });

    if (existingMember) {
      throw new ConflictException('Cet utilisateur fait déjà partie du projet');
    }

    return await this.prisma.projectMember.create({
      data: {
        projectId: projectId,
        userId: targetUser.id,
        role: createProjectMemberDto.role,
      },
    });
  }
}
