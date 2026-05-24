import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectSchema,
  type CreateProjectDto,
} from './dto/create-project.dto';
import * as updateProjectDto from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/types/active-user.interface';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateProjectSchema))
  create(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  findAll(@GetUser() user: ActiveUser) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: ActiveUser) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateProjectDto.UpdateProjectSchema))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: updateProjectDto.UpdateProjectDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.projectsService.update(id, user.id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: ActiveUser) {
    return this.projectsService.remove(id, user.id);
  }
}
