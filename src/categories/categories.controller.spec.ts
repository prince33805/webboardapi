import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should create and return a category', async () => {
      const dto: CreateCategoryDto = { name: 'Tech' };
      const result = { id: 1, name: 'Tech', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, posts: [] };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = [{ id: 1, name: 'Tech', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, posts: [] }];

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const result = { id: 1, name: 'Tech', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, posts: [] };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if category is not found', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    it('should update and return a category', async () => {
      const dto: UpdateCategoryDto = { name: 'Science' };
      const result = { id: 1, name: 'Science', createdAt: new Date(), updatedAt: new Date(), deletedAt: null, posts: [] };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(999);
    });
  });
});
