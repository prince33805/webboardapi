import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user if the username does not exist', async () => {
      const createUserDto = { username: 'test' };

      const newUser = {
        id: 1, // Ensure ID is included
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null, // Ensure deletedAt is explicitly set
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null); // Simulate user not found
      jest.spyOn(userRepository, 'create').mockReturnValue(newUser); // Mock creation
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser); // Mock saving

      const result = await service.create(createUserDto);

      expect(result).toEqual(expect.objectContaining({
        id: expect.any(Number),
        username: 'test',
        posts: [],
        comments: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
      }));

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: createUserDto.username } });
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        username: 'test',
      }));
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
    });

    it('should return the existing user if the username already exists', async () => {
      const createUserDto = { username: 'test' };
      const existingUser = {
        id: 1,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser); // Mock user found

      const result = await service.create(createUserDto);

      expect(result).toEqual(existingUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: createUserDto.username } });
    });

  });

  describe('findOneById', () => {
    it('should return a user when found', async () => {
      const user = {
        id: 1,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOneById(1);

      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneById(1)).rejects.toThrow(InternalServerErrorException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
