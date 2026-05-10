import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(loginDTO: LoginDTO) {
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = userExists;
    return userWithoutPassword;
  }
}
