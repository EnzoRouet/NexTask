import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';

type AdminServiceResult = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: Date;
};

const mockDate = new Date();
const mockServiceUser: AdminServiceResult = {
  id: '1',
  name: 'Test',
  email: 'test@test.com',
  role: Role.USER,
  createdAt: mockDate,
};

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    resetUserPassword: jest.fn(),
    updateUserRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockAdminService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call adminService.findAll and return result', async () => {
      // Arrange
      const expectedResult: AdminServiceResult[] = [mockServiceUser];
      mockAdminService.findAll.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(mockAdminService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call adminService.findOne with id and return result', async () => {
      // Arrange
      mockAdminService.findOne.mockResolvedValue(mockServiceUser);

      // Act
      const result = await controller.findOne('1');

      // Assert
      expect(mockAdminService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockServiceUser);
    });
  });

  describe('resetPassword', () => {
    it('should call adminService.resetUserPassword with id and password', async () => {
      // Arrange
      mockAdminService.resetUserPassword.mockResolvedValue(mockServiceUser);

      // Act
      const result = await controller.resetPassword('1', 'newPass');

      // Assert
      expect(mockAdminService.resetUserPassword).toHaveBeenCalledWith(
        '1',
        'newPass',
      );
      expect(result).toEqual(mockServiceUser);
    });
  });

  describe('updateRole', () => {
    it('should call adminService.updateUserRole with id and role', async () => {
      // Arrange
      const expectedResult: AdminServiceResult = {
        ...mockServiceUser,
        role: Role.ADMIN,
      };
      mockAdminService.updateUserRole.mockResolvedValue(expectedResult);

      // Act
      const result = await controller.updateRole('1', Role.ADMIN);

      // Assert
      expect(mockAdminService.updateUserRole).toHaveBeenCalledWith(
        '1',
        Role.ADMIN,
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
