import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import {
  type CreateDocumentationDto,
  CreateDocumentationSchema,
} from './dto/create-documentation.dto';
import {
  type UpdateDocumentationDto,
  UpdateDocumentationSchema,
} from './dto/update-documentation.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ActiveUser } from '../auth/types/active-user.interface';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ProjectRoleGuard } from '../auth/guards/project-role/project-role.guard';
import {
  RequireProjectRole,
  ResourceType,
} from '../auth/decorators/require-role.decorator';
import { ProjectRole } from '@prisma/client';

@Controller('documentation')
export class DocumentationController {
  constructor(private readonly documentationService: DocumentationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body(new ZodValidationPipe(CreateDocumentationSchema))
    createDocumentationDto: CreateDocumentationDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.documentationService.create(createDocumentationDto, user.id);
  }

  @Get('all/:projectId')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @GetUser() user: ActiveUser,
  ) {
    return this.documentationService.findAll(projectId, user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: ActiveUser) {
    return this.documentationService.findOne(id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateDocumentationSchema))
    updateDocumentationDto: UpdateDocumentationDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.documentationService.update(
      id,
      updateDocumentationDto,
      user.id,
    );
  }

  @Delete(':docId')
  @UseGuards(JwtAuthGuard, ProjectRoleGuard)
  @RequireProjectRole({
    roles: [ProjectRole.PO, ProjectRole.OWNER],
    resource: ResourceType.DOCUMENTATION,
  })
  remove(
    @Param('docId', ParseUUIDPipe) id: string,
    @GetUser() user: ActiveUser,
  ) {
    return this.documentationService.remove(id, user.id);
  }
}
