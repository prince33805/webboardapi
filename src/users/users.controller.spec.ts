import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(), // Mock create method
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call usersService.create() and return the created user', async () => {
      const dto = { username: 'test' };
      const mockUser = { id: 1, username: 'test', posts: [], comments: [], createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(dto);

      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });
});
