import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(createDTO: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: createDTO.email,
      },
    });

    if (userExists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(createDTO.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: createDTO.email,
        password: hashedPassword,
        name: createDTO.name,
      },
      omit: { password: true },
    });

    return newUser;
  }

  async login(loginDTO: LoginDto) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: loginDTO.email,
      },
    });

    if (!userExists) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const passwordExists = await bcrypt.compare(
      loginDTO.password,
      userExists.password,
    );

    if (!passwordExists) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = {
      sub: userExists.id,
      email: userExists.email,
      role: userExists.role,
    };

    const access_token = await this.jwt.signAsync(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = userExists;
    return { user: userWithoutPassword, access_token };
  }
}
