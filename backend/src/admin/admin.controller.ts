import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOne(id);
  }

  @Patch('users/:id/reset-password')
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.adminService.resetUserPassword(id, newPassword);
  }

  @Patch('users/:id/update-role')
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newRole') newRole: Role,
  ) {
    return await this.adminService.updateUserRole(id, newRole);
  }
}
