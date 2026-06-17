import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Get,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import {
  type CreateProjectMemberDto,
  CreateProjectMemberSchema,
} from './dto/create-project-member.dto';
import { type ActiveUser } from '../auth/types/active-user.interface';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  type UpdateProjectMemberDto,
  UpdateProjectMemberSchema,
} from './dto/update-project-member.dto';
import { ProjectRole } from '@prisma/client';
import {
  RequireProjectRole,
  ResourceType,
} from '../auth/decorators/require-role.decorator';
import { ProjectRoleGuard } from '../auth/guards/project-role/project-role.guard';

@Controller('projects')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Post(':projectId/members')
  @UseGuards(JwtAuthGuard)
  create(
    @Body(new ZodValidationPipe(CreateProjectMemberSchema))
    createProjectMemberDto: CreateProjectMemberDto,
    @Param('projectId', ParseUUIDPipe) id: string,
    @GetUser() user: ActiveUser,
  ) {
    return this.projectMembersService.create(
      id,
      createProjectMemberDto,
      user.id,
    );
  }

  @Get(':projectId/members')
  @UseGuards(JwtAuthGuard)
  findAll(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.projectMembersService.findAll(projectId);
  }

  @Patch(':projectId/members/:userId')
  @UseGuards(JwtAuthGuard)
  updateRole(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body(new ZodValidationPipe(UpdateProjectMemberSchema))
    updateDto: UpdateProjectMemberDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.projectMembersService.updateRole(
      projectId,
      targetUserId,
      updateDto.role,
      user.id,
    );
  }

  @Delete(':projectId/members/:userId')
  @UseGuards(JwtAuthGuard, ProjectRoleGuard)
  @RequireProjectRole({
    roles: [ProjectRole.PO, ProjectRole.OWNER],
    resource: ResourceType.PROJECT, // Le Vigile intercepte le :projectId de l'URL
  })
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @GetUser() user: ActiveUser,
  ) {
    return this.projectMembersService.remove(projectId, targetUserId, user.id);
  }
}
