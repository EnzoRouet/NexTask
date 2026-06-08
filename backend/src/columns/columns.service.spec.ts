import { Test, TestingModule } from '@nestjs/testing';
import { ColumnsService } from './columns.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import type { CreateColumnDto } from './dto/create-column.dto';
import type { UpdateColumnDto } from './dto/update-column.dto';

const mockPrismaService = {
  boardColumn: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ColumnsService', () => {
  let service: ColumnsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a column with position + 1000 from the last column', async () => {
      // Arrange
      const createDto: CreateColumnDto = {
        name: 'New Column',
        projectId: 'proj-1',
      };
      const lastColumn = { id: 'col-1', position: 2000 };
      const expectedColumn = { id: 'col-2', ...createDto, position: 3000 };

      prisma.boardColumn.findFirst.mockResolvedValue(lastColumn);
      prisma.boardColumn.create.mockResolvedValue(expectedColumn);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedColumn);
      expect(prisma.boardColumn.findFirst).toHaveBeenCalledWith({
        where: { projectId: createDto.projectId },
        orderBy: { position: 'desc' },
      });
      expect(prisma.boardColumn.create).toHaveBeenCalledWith({
        data: { ...createDto, position: 3000 },
      });
    });

    it('should create a column with position 1000 if it is the first column of the project', async () => {
      // Arrange
      const createDto: CreateColumnDto = {
        name: 'First Column',
        projectId: 'proj-1',
      };
      const expectedColumn = { id: 'col-1', ...createDto, position: 1000 };

      prisma.boardColumn.findFirst.mockResolvedValue(null);
      prisma.boardColumn.create.mockResolvedValue(expectedColumn);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(expectedColumn);
      expect(prisma.boardColumn.create).toHaveBeenCalledWith({
        data: { ...createDto, position: 1000 },
      });
    });
  });

  describe('update', () => {
    it('should update and return the column', async () => {
      // Arrange
      const id = 'col-1';
      const updateDto: UpdateColumnDto = { name: 'Updated Name' };
      const expectedColumn = { id, name: 'Updated Name', position: 1000 };

      prisma.boardColumn.update.mockResolvedValue(expectedColumn);

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(result).toEqual(expectedColumn);
      expect(prisma.boardColumn.update).toHaveBeenCalledWith({
        where: { id },
        data: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete the column if it is empty', async () => {
      // Arrange
      const id = 'col-1';
      const expectedColumn = { id, name: 'To Delete' };

      prisma.boardColumn.delete.mockResolvedValue(expectedColumn);

      // Act
      const result = await service.remove(id);

      // Assert
      expect(result).toEqual(expectedColumn);
      expect(prisma.boardColumn.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw a BadRequestException if the column still contains tickets (Prisma P2003 error)', async () => {
      // Arrange
      const id = 'col-1';
      prisma.boardColumn.delete.mockRejectedValue({ code: 'P2003' });

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
    });

    it('should throw the original error if it is not a P2003 error', async () => {
      // Arrange
      const id = 'col-1';
      const randomError = new Error('Database down');
      prisma.boardColumn.delete.mockRejectedValue(randomError);

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow(randomError);
    });
  });
});
