import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Get,
  Patch,
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
}
