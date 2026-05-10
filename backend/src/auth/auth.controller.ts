import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as registerDto from './dto/register.dto';
import * as loginDto from './dto/login.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerDto.RegisterSchema))
  async register(@Body() body: registerDto.RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginDto.LoginSchema))
  async login(@Body() body: loginDto.LoginDto) {
    return this.authService.login(body);
  }
}
