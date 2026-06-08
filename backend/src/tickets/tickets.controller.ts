import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { ActiveUser } from '../auth/types/active-user.interface';

import {
  CreateTicketSchema,
  type CreateTicketDto,
} from './dto/create-ticket.dto';

import {
  UpdateTicketSchema,
  type UpdateTicketDto,
} from './dto/update-ticket.dto';
import {
  type AssignTicketDto,
  AssignTicketSchema,
} from './dto/assign-ticket.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTicketSchema))
    createTicketDto: CreateTicketDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.ticketsService.create(createTicketDto, user.id);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @GetUser() user: ActiveUser) {
    return this.ticketsService.findAll(projectId, user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: ActiveUser) {
    return this.ticketsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateTicketSchema))
    updateTicketDto: UpdateTicketDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user.id);
  }

  @Patch(':id/assign')
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AssignTicketSchema))
    assignTicketDto: AssignTicketDto,
    @GetUser() user: ActiveUser,
  ) {
    return this.ticketsService.assign(
      id,
      assignTicketDto.targetUserId,
      user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: ActiveUser) {
    return this.ticketsService.remove(id, user.id);
  }
}
