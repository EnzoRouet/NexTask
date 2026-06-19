import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.deleteFilter.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string) {
    const user = await this.prisma.deleteFilter.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async resetUserPassword(userId: string, newPassword: string) {
    await this.findOne(userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async updateUserRole(userId: string, newRole: Role) {
    await this.findOne(userId);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async removeUser(userId: string) {
    const user = await this.findOne(userId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable ou déjà supprimé');
    }

    // On va juste obfusquer le mail de la personne pour qu'elle puisse se register de nouveau avec
    const obfuscatedEmail = `deleted_${Date.now()}_${user.email}`;

    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: obfuscatedEmail,
      },
    });
  }
}
