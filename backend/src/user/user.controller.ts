import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserSchema, type UpdateUserDto } from './dto/update-user.dto';
import {
  UpdatePasswordSchema,
  type UpdatePasswordDto,
} from './dto/update-password.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../admin/types/auth-res';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.userService.findOne(req.user.id);
  }

  @Patch('me')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Patch('me/password')
  updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(UpdatePasswordSchema))
    updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(req.user.id, updatePasswordDto);
  }

  @Delete('me')
  deleteAccount(@Req() req: AuthenticatedRequest) {
    return this.userService.remove(req.user.id);
  }
}
