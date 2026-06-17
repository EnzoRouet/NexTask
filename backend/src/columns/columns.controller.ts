import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import {
  CreateColumnSchema,
  type CreateColumnDto,
} from './dto/create-column.dto';
import type { UpdateColumnDto } from './dto/update-column.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectRole } from '@prisma/client';
import {
  RequireProjectRole,
  ResourceType,
} from '../auth/decorators/require-role.decorator';
import { ProjectRoleGuard } from '../auth/guards/project-role/project-role.guard';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post(':projectId')
  @UseGuards(JwtAuthGuard, ProjectRoleGuard)
  @RequireProjectRole({
    roles: [ProjectRole.PO, ProjectRole.OWNER],
    resource: ResourceType.PROJECT,
  })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body(new ZodValidationPipe(CreateColumnSchema))
    createColumnDto: CreateColumnDto,
  ) {
    return this.columnsService.create(projectId, createColumnDto);
  }

  @Patch(':columnId')
  @UseGuards(JwtAuthGuard, ProjectRoleGuard)
  @RequireProjectRole({
    roles: [ProjectRole.PO, ProjectRole.OWNER],
    resource: ResourceType.COLUMN,
  })
  update(
    @Param('columnId', ParseUUIDPipe) columnId: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(columnId, updateColumnDto);
  }

  @Delete(':columnId')
  @UseGuards(JwtAuthGuard, ProjectRoleGuard)
  @RequireProjectRole({
    roles: [ProjectRole.PO, ProjectRole.OWNER],
    resource: ResourceType.COLUMN,
  })
  remove(@Param('columnId', ParseUUIDPipe) columnId: string) {
    return this.columnsService.remove(columnId);
  }
}
