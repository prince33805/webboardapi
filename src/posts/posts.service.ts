import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Like, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly categoryService: CategoriesService,
  ) { }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      const { title, content, authorId, categoryId } = createPostDto;

      // Find the user by ID
      const author = await this.usersService.findOneById(authorId);
      console.log("author", author)
      if (!author) {
        throw new Error('User not found');
      }
      const category = await this.categoryService.findOne(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      console.log("createPostDto", createPostDto)
      // Create a new post and associate it with the author
      const newPost = this.postRepository.create({
        title,
        content,
        author,
        category
      });

      return await this.postRepository.save(newPost);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to create post');
    }
  }

  async searchPosts(search: string): Promise<Post[]> {
    try {
      console.log("search", search)
      if (!search) {
        return await this.postRepository.find({
          relations: ['comments', 'author']
        }); // Return all posts if no search query
      }
      const posts = await this.postRepository.find({
        where: [
          { title: Like(`%${search}%`) },
          { content: Like(`%${search}%`) }
        ],
        relations: ['comments', 'author']
      });
      return posts
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to find all post');
    }
  }

  async findAll(): Promise<Post[]> {
    try {
      const posts = await this.postRepository.find({
        relations: ['comments','author']
      });
      return posts
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to find all post');
    }
  }

  async findOne(id: number): Promise<Post | null> {
    try {
      console.log("id", id)

      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['comments','author'], // Load related comments
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return post;
    } catch (error) {
      console.error("Database error:", error);
      throw new InternalServerErrorException(error.message || 'Error retrieving post');
    }
  }

  async findPostAuthor(id: number, authorId: number): Promise<Post | null> {
    try {
      console.log("id", id)

      const post = await this.postRepository.findOne({
        where: {
          id,
          author: { id: authorId }
        },
        relations: ['comments','author'], // Load related comments
      });

      if (!post) {
        throw new NotFoundException(`Post with Id:${id} and Author Id:${authorId} is not found`);
      }
      return post;
    } catch (error) {
      console.error("Database error:", error);
      throw new InternalServerErrorException(error.message || 'Error retrieving post');
    }
  }

  async findByAuthor(id: number, search: string): Promise<Post[]> {
    try {
      console.log("Author ID:", id);
      console.log("search", search)

      if (!search) {
        return await this.postRepository.find({
          where: { author: { id } }, // Properly reference the relation
          relations: ["author", "comments"], // Ensure the relation is loaded if needed
        });
      }

      const posts = await this.postRepository.find({
        where: [
          {
            author: { id },
            title: Like(`%${search}%`),
          },
          {
            author: { id },
            content: Like(`%${search}%`),
          }
        ],
        relations: ["author", "comments"],
      });

      return posts

    } catch (error) {
      console.error("Database error:", error);
      throw new InternalServerErrorException(error.message || "Error retrieving post");
    }
  }

  async findByCategory(id: number, search: string): Promise<Post[]> {
    try {
      console.log("Category ID:", id);

      if (!search) {
        return await this.postRepository.find({
          where: { category: { id } }, // Properly reference the relation
          relations: ["author", "comments"], // Ensure the relation is loaded if needed
        });
      }

      const posts = await this.postRepository.find({
        where: [
          {
            category: { id },
            title: Like(`%${search}%`),
          },
          {
            category: { id },
            content: Like(`%${search}%`),
          }
        ],
        relations: ["author", "comments"],
      });

      return posts

    } catch (error) {
      console.error("Database error:", error);
      throw new InternalServerErrorException(error.message || "Error retrieving post");
    }
  }

  async findByAuthorCategory(id: number, categoryId: number, search: string): Promise<Post[]> {
    try {
      console.log("Author ID:", id);
      console.log("search:", search);

      if (!search) {
        console.log("not search")
        return await this.postRepository.find({
          where: {
            author: { id },
            category: { id: categoryId }
          }, // Properly reference the relation
          relations: ["author", "comments"], // Ensure the relation is loaded if needed
        });
      }

      console.log("with search")
      const posts = this.postRepository.find({
        where: [
          {
            author: { id },
            category: { id: categoryId },
            title: Like(`%${search}%`),
          },
          {
            author: { id },
            category: { id: categoryId },
            content: Like(`%${search}%`),
          },
        ],
        relations: ["author", "comments"],
      });
      return posts

    } catch (error) {
      console.error("Database error:", error);
      throw new InternalServerErrorException(error.message || "Error retrieving post");
    }
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      console.log("patch")
      const post = await this.findOne(id);
      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // Explicitly update category
      if (updatePostDto.categoryId) {
        const category = await this.categoryService.findOne(updatePostDto.categoryId);
        if (!category) {
          throw new NotFoundException(`Category with ID ${updatePostDto.categoryId} not found`);
        }
        post.category = category;
      }

      Object.assign(post, updatePostDto);
      return await this.postRepository.save(post);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error to update post');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.postRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error to delete post');
    }
  }
}
