import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm';

const mockCategory = {
  id: 1,
  name: 'Technology',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn().mockReturnValue(mockCategory),
            save: jest.fn().mockResolvedValue(mockCategory),
            find: jest.fn().mockResolvedValue([mockCategory]),
            findOne: jest.fn().mockResolvedValue(mockCategory),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      expect(await service.create({ name: 'Technology' })).toEqual(mockCategory);
      expect(repository.create).toHaveBeenCalledWith({ name: 'Technology' });
      expect(repository.save).toHaveBeenCalledWith(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      expect(await service.findAll()).toEqual([mockCategory]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      expect(await service.findOne(1)).toEqual(mockCategory);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update and return a category', async () => {
      const updatedCategory = {
        id: 1,
        name: 'Science',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        posts: [],
      };

      jest.spyOn(repository, 'save').mockResolvedValue(updatedCategory);

      await expect(service.update(1, { name: 'Science' })).resolves.toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Science',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: null,
          posts: expect.any(Array),
        })
      );

      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Science' }));
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      expect(await service.remove(1)).toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Database error'));
  
      await expect(service.remove(1)).rejects.toThrow(InternalServerErrorException);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
