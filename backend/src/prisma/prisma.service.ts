import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public readonly deleteFilter = this.$extends({
    query: {
      user: {
        async findMany({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findUnique({ args, query }) {
          const result = await query(args);
          if (result?.deletedAt) return null;
          return result;
        },
      },
      project: {
        async findMany({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findUnique({ args, query }) {
          const result = await query(args);
          if (result?.deletedAt) return null;
          return result;
        },
      },
    },
  });
  async onModuleInit() {
    await this.$connect();
  }
}
