import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import {
  CreateColumnSchema,
  type CreateColumnDto,
} from './dto/create-column.dto';
import type { UpdateColumnDto } from './dto/update-column.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateColumnSchema))
    createColumnDto: CreateColumnDto,
  ) {
    return this.columnsService.create(createColumnDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.columnsService.remove(id);
  }
}
