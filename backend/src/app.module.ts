import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TicketsModule } from './tickets/tickets.module';
import { ProjectsModule } from './projects/projects.module';
import { ColumnsModule } from './columns/columns.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TicketsModule,
    ProjectsModule,
    ColumnsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
