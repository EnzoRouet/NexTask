import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectRole } from '@prisma/client';

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

    const requesterRole =
      requesterId === project.ownerId ? 'OWNER' : project.members[0]?.role;

    if (!requesterRole) {
      throw new ForbiddenException('Vous ne faites pas partie de ce projet');
    }

    const roleWeights = {
      OWNER: 3,
      PO: 2,
      DEVELOPER: 1,
    };

    const targetRole = createProjectMemberDto.role;

    if (roleWeights[targetRole] > roleWeights[requesterRole]) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de donné ce rang a la personne que vous conviez",
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

  async findAll(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projet introuvable');
    }

    const members = await this.prisma.projectMember.findMany({
      where: { projectId: projectId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    const ownerAsMember = {
      id: `owner-${project.owner.id}`,
      user: {
        id: project.owner.id,
        name: `${project.owner.name} (Créateur)`,
      },
      role: 'OWNER',
    };

    return [ownerAsMember, ...members];
  }

  async updateRole(
    projectId: string,
    targetUserId: string,
    newRole: ProjectRole,
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

    if (!project) throw new NotFoundException('Projet introuvable');

    const isOwner = requesterId === project.ownerId;
    const isPO = 'PO' === project.members[0]?.role;

    if (!isOwner && !isPO) {
      throw new ForbiddenException(
        'Seul le créateur ou un PO peut modifier les rôles.',
      );
    }

    if (targetUserId === project.ownerId) {
      throw new ForbiddenException(
        'Le rôle du créateur du projet ne peut pas être modifié.',
      );
    }

    const targetMember = await this.prisma.projectMember.findFirst({
      where: { projectId: projectId, userId: targetUserId },
    });

    if (!targetMember) {
      throw new NotFoundException('Membre introuvable dans ce projet.');
    }

    return await this.prisma.projectMember.update({
      where: { id: targetMember.id },
      data: { role: newRole },
    });
  }

  async remove(projectId: string, targetUserId: string, requesterId: string) {
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

    if (targetUserId === project?.ownerId) {
      throw new ForbiddenException(
        "Vous n'avez pas le droit d'exclure le détenteur du projet",
      );
    }

    const targetMember = await this.prisma.projectMember.findFirst({
      where: { projectId: projectId, userId: targetUserId },
    });

    if (!targetMember) {
      throw new NotFoundException('Membre introuvable dans ce projet.');
    }

    const requesterRole =
      requesterId === project.ownerId ? 'OWNER' : project.members[0]?.role;

    if (!requesterRole) {
      throw new ForbiddenException('Vous ne faites pas partie de ce projet');
    }

    const roleWeights = {
      OWNER: 3,
      PO: 2,
      DEVELOPER: 1,
    };

    if (roleWeights[targetMember.role] > roleWeights[requesterRole]) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'exclure ce membre du projet",
      );
    }

    return await this.prisma.projectMember.delete({
      where: { id: targetMember.id },
    });
  }
}
