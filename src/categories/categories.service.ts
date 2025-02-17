import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const newCategory = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to create post');
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to find all category');
    }
  }

  async findOne(id: number): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error retrieving post');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const category = await this.findOne(id);
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      Object.assign(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error to update post');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.categoryRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error to delete post');
    }
  }
}
