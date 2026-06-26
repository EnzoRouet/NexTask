import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../admin/types/auth-res';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    findOne: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserId = 'uuid-123';
  const mockRequest = {
    user: {
      id: mockUserId,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should successfully call findOne service with request user id', async () => {
      // Arrange
      const expectedUser = {
        id: mockUserId,
        email: 'test@nextask.pro',
        name: 'Enzo',
      };
      mockUserService.findOne.mockResolvedValue(expectedUser);

      // Act
      const result = await controller.getProfile(mockRequest);

      // Assert
      expect(mockUserService.findOne).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('updateProfile', () => {
    it('should successfully pass the update payload and user id to the service', async () => {
      // Arrange
      const updateDto = { name: 'New Name', email: 'updated@nextask.pro' };
      const expectedUpdatedUser = { id: mockUserId, ...updateDto };
      mockUserService.update.mockResolvedValue(expectedUpdatedUser);

      // Act
      const result = await controller.updateProfile(mockRequest, updateDto);

      // Assert
      expect(mockUserService.update).toHaveBeenCalledWith(
        mockUserId,
        updateDto,
      );
      expect(result).toEqual(expectedUpdatedUser);
    });
  });

  describe('updatePassword', () => {
    it('should successfully pass the password payloads and user id to the service', async () => {
      // Arrange
      const passwordDto = {
        oldPassword: 'oldPassword123!',
        newPassword: 'newPassword123!',
        confirmPassword: 'newPassword123!',
      };
      const expectedResponse = {
        message: 'Mot de passe mis à jour avec succès.',
      };
      mockUserService.updatePassword.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.updatePassword(mockRequest, passwordDto);

      // Assert
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(
        mockUserId,
        passwordDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteAccount', () => {
    it('should successfully call remove service with request user id', async () => {
      // Arrange
      const expectedDeletedUser = {
        id: mockUserId,
        email: 'test@nextask.pro',
        name: 'Enzo',
      };
      mockUserService.remove.mockResolvedValue(expectedDeletedUser);

      // Act
      const result = await controller.deleteAccount(mockRequest);

      // Assert
      expect(mockUserService.remove).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedDeletedUser);
    });
  });
});
