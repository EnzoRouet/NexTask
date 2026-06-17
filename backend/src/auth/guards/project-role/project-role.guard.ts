import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  REQUIRE_ROLE_KEY,
  RequireRoleOptions,
  ResourceType,
} from '../../decorators/require-role.decorator';
import { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { ProjectRole } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

const defaultParamNames: Record<ResourceType, string> = {
  [ResourceType.PROJECT]: 'projectId',
  [ResourceType.DOCUMENTATION]: 'docId',
  [ResourceType.TICKET]: 'ticketId',
};

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredOptions =
      this.reflector.getAllAndOverride<RequireRoleOptions>(REQUIRE_ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredOptions) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const targetParam =
      requiredOptions.paramName ?? defaultParamNames[requiredOptions.resource];

    const resourceId = request.params[targetParam] as string;

    if (!resourceId) return false;

    let projectId: string | null;

    switch (requiredOptions.resource) {
      case ResourceType.PROJECT:
        projectId = resourceId;
        break;

      case ResourceType.DOCUMENTATION: {
        const doc = await this.prisma.doc.findUnique({
          where: { id: resourceId },
          select: { projectId: true },
        });
        projectId = doc?.projectId ?? null;
        break;
      }

      case ResourceType.TICKET: {
        const ticket = await this.prisma.ticket.findUnique({
          where: { id: resourceId },
          select: { projectId: true },
        });
        projectId = ticket?.projectId ?? null;
        break;
      }
    }

    if (!projectId) return false;

    const userId = request.user.sub;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId: userId },
        },
      },
    });

    if (!project) return false;

    let currentUserRole: ProjectRole;

    if (project.ownerId === userId) {
      currentUserRole = ProjectRole.OWNER;
    } else if (project.members && project.members.length > 0) {
      currentUserRole = project.members[0].role;
    } else {
      return false;
    }

    return requiredOptions.roles.includes(currentUserRole);
  }
}
