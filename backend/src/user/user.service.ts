import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.deleteFilter.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.deleteFilter.user.findUnique({
      where: { id },
    });

    if (!existingUser) throw new NotFoundException('Utilisateur introuvable.');

    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: { id: true, email: true, name: true, createdAt: true },
    });
  }

  async remove(id: string) {
    const existingUser = await this.prisma.deleteFilter.user.findUnique({
      where: { id },
    });

    if (!existingUser) throw new NotFoundException('Utilisateur introuvable.');

    const user = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const isOldPasswordCorrect = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      throw new ForbiddenException('Ancien mot de passe incorrect.');
    }

    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Mot de passe mis à jour avec succès.' };
  }
}
