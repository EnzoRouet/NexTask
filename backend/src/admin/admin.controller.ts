import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Post,
  Req,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { Role } from '@prisma/client';
import type { AuthenticatedRequest } from './types/auth-res';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  findAll() {
    return this.adminService.findAll();
  }

  @Get('users/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOne(id);
  }

  @Get('projects')
  findAllProjects() {
    return this.adminService.findAllProjects();
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

  @Post('projects/:id/investigate')
  async investigate(
    @Param('id', ParseUUIDPipe) projectId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminId = req.user.id;
    return this.adminService.investigateProject(projectId, adminId);
  }

  @Patch('projects/:id/suspend')
  async suspend(@Param('id', ParseUUIDPipe) projectId: string) {
    return this.adminService.suspendProject(projectId);
  }

  @Delete('users/:id')
  async removeUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.adminService.removeUser(id);
  }
}
