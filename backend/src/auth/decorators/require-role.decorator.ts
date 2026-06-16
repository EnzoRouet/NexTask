import { ProjectRole } from '@prisma/client';
import { SetMetadata } from '@nestjs/common';

export enum ResourceType {
  PROJECT = 'PROJECT',
  DOCUMENTATION = 'DOCUMENTATION',
  TICKET = 'TICKET',
}

export interface RequireRoleOptions {
  roles: ProjectRole[];
  resource: ResourceType;
  paramName?: string;
}

export const REQUIRE_ROLE_KEY = 'requireRole';

export const RequireProjectRole = (options: RequireRoleOptions) =>
  SetMetadata(REQUIRE_ROLE_KEY, options);
