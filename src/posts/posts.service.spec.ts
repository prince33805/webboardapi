import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Like, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { CreatePostDto } from './dto/create-post.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Category } from '../categories/entities/category.entity';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsService', () => {
  let postsService: PostsService;
  let postRepository: Repository<Post>;
  let usersService: UsersService;
  let categoryService: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useClass: Repository,
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    usersService = module.get<UsersService>(UsersService);
    categoryService = module.get<CategoriesService>(CategoriesService);
  });

  describe('create', () => {
    it('should create a post when user and category exist', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'This is a test post',
        authorId: 1,
        categoryId: 2,
      };

      const mockUser = {
        id: 1,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockPost = {
        ...createPostDto,
        id: 1,
        author: mockUser,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUser);
      jest.spyOn(categoryService, 'findOne').mockResolvedValue(mockCategory);
      jest.spyOn(postRepository, 'create').mockReturnValue(mockPost);
      jest.spyOn(postRepository, 'save').mockResolvedValue(mockPost);

      const result = await postsService.create(createPostDto);

      expect(result).toEqual(mockPost);
      expect(usersService.findOneById).toHaveBeenCalledWith(createPostDto.authorId);
      expect(categoryService.findOne).toHaveBeenCalledWith(createPostDto.categoryId);
      expect(postRepository.create).toHaveBeenCalledWith({
        title: createPostDto.title,
        content: createPostDto.content,
        author: mockUser,
        category: mockCategory,
      });
      expect(postRepository.save).toHaveBeenCalledWith(mockPost);
    });

    it('should throw an error if user does not exist', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);

      await expect(postsService.create({ title: 'Test', content: 'Test', authorId: 1, categoryId: 1 }))
        .rejects.toThrow('User not found');
    });

    it('should throw an error if category does not exist', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({
        id: 1,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null, // Ensure deletedAt is explicitly set
      });
      jest.spyOn(categoryService, 'findOne').mockResolvedValue(null as unknown as Category);

      await expect(postsService.create({ title: 'Test', content: 'Test', authorId: 1, categoryId: 1 }))
        .rejects.toThrow('Category not found');
    });

    it('should throw InternalServerErrorException on repository failure', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({
        id: 1,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null, // Ensure deletedAt is explicitly set 
      });
      jest.spyOn(categoryService, 'findOne').mockResolvedValue({
        id: 1, name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      jest.spyOn(postRepository, 'save').mockRejectedValue(new Error('Database error'));

      await expect(postsService.create({ title: 'Test', content: 'Test', authorId: 1, categoryId: 1 }))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('searchPosts', () => {
    it('should return a post if found by search', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }];

      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.searchPosts('Test')).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: [
          { title: Like('%Test%') },
          { content: Like('%Test%') }
        ],
        relations: ['comments', 'author']
      });
    });

    it('should return all posts if search query is empty', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }];

      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);
      // postRepository.find.mockResolvedValue(posts);

      expect(await postsService.searchPosts('')).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        relations: ['comments', 'author']
      });
    });


  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];

      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findAll()).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on repository failure', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];

      jest.spyOn(postRepository, 'find').mockRejectedValue(new Error('Database error'));

      await expect(postsService.findAll()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a post if found', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const post = {
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }
      // const post = { id: 1, title: 'Test Post', comments: [] };

      jest.spyOn(postRepository, 'findOne').mockResolvedValue(post);

      expect(await postsService.findOne(1)).toEqual(post);
      expect(postRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['comments', 'author'] });
    });

    it('should throw InternalServerErrorException if post is not found', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null);

      await expect(postsService.findOne(1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findPostAuthor', () => {
    it('should return posts by id, authorId', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = {
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(posts);

      expect(await postsService.findPostAuthor(1, 2)).toEqual(posts);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, author: { id: 2 } },
        relations: ['comments', 'author'],
      });
    });

    it('should throw InternalServerErrorException if no posts found', async () => {
      jest.spyOn(postRepository, 'findOne').mockResolvedValue(null); // Simulating no posts found

      await expect(postsService.findPostAuthor(1, 2)).rejects.toThrow(InternalServerErrorException); // Expecting NotFoundException
    });

    it('should throw InternalServerErrorException if Database error', async () => {
      jest.spyOn(postRepository, 'findOne').mockRejectedValue(new Error('Database error')); // Simulating no posts found

      await expect(postsService.findPostAuthor(1, 2)).rejects.toThrow(InternalServerErrorException); // Expecting NotFoundException
    });
  });

  describe('findByAuthor', () => {
    it('should return posts by author with no search', async () => {
      // const posts = [{ id: 1, title: 'Test Post' }];
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findByAuthor(1, "")).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: { author: { id: 1 } },
        relations: ['author', 'comments']
      });
    });

    it('should return posts by author with search', async () => {
      // const posts = [{ id: 1, title: 'Test Post' }];
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findByAuthor(2, "test")).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: [
          {
            author: { id: 2 },
            title: Like('%test%')
          },
          {
            author: { id: 2 },
            content: Like('%test%')
          }
        ],
        relations: ['author', 'comments']
      });
    });

    it('should return [] if no posts found', async () => {
      jest.spyOn(postRepository, 'find').mockResolvedValue([]); // Simulating no posts found

      expect(await postsService.findByAuthor(1, "")).toEqual([]); // Expecting NotFoundException
    });

    it('should throw InternalServerErrorException if Database error', async () => {
      jest.spyOn(postRepository, 'find').mockRejectedValue(new Error('Database error')); // Simulating no posts found

      await expect(postsService.findByAuthor(2, "test")).rejects.toThrow(InternalServerErrorException); // Expecting NotFoundException
    });
  });

  describe('findByCategory', () => {
    it('should return posts by category id with no search', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findByCategory(1, "")).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: { category: { id: 1 } },
        relations: ['author', 'comments'],
      });
    });

    it('should return posts by category with search', async () => {
      // const posts = [{ id: 1, title: 'Test Post' }];
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findByCategory(2, "test")).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: [
          {
            category: { id: 2 },
            title: Like('%test%')
          },
          {
            category: { id: 2 },
            content: Like('%test%')
          }
        ],
        relations: ['author', 'comments']
      });
    });

    it('should return [] if no posts found', async () => {
      jest.spyOn(postRepository, 'find').mockResolvedValue([]); // Simulating no posts found

      expect(await postsService.findByCategory(1, "")).toEqual([]); // Expecting NotFoundException
    });

    it('should throw InternalServerErrorException if Database error', async () => {
      jest.spyOn(postRepository, 'find').mockRejectedValue(new Error('Database error')); // Simulating no posts found

      await expect(postsService.findByCategory(1, "")).rejects.toThrow(InternalServerErrorException); // Expecting NotFoundException
    });
  });

  describe('findByAuthorCategory', () => {
    it('should return posts by category,author id with no search', async () => {
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findByAuthorCategory(2, 2, "")).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: { category: { id: 2 }, author: { id: 2 } },
        relations: ['author', 'comments'],
      });
    });

    it('should return posts by category with search', async () => {
      // const posts = [{ id: 1, title: 'Test Post' }];
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const posts = [{
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }];
      jest.spyOn(postRepository, 'find').mockResolvedValue(posts);

      expect(await postsService.findByAuthorCategory(2, 2, "test")).toEqual(posts);
      expect(postRepository.find).toHaveBeenCalledWith({
        where: [
          {
            author: { id: 2 },
            category: { id: 2 },
            title: Like('%test%')
          },
          {
            author: { id: 2 },
            category: { id: 2 },
            content: Like('%test%')
          }
        ],
        relations: ['author', 'comments']
      });
    });

    it('should return [] if no posts found', async () => {
      jest.spyOn(postRepository, 'find').mockResolvedValue([]); // Simulating no posts found

      expect(await postsService.findByAuthorCategory(2, 2, "")).toEqual([]); // Expecting NotFoundException
    });

    it('should throw InternalServerErrorException if Database error', async () => {
      jest.spyOn(postRepository, 'find').mockRejectedValue(new Error('Database error')); // Simulating no posts found

      await expect(postsService.findByAuthorCategory(2, 2, "")).rejects.toThrow(InternalServerErrorException); // Expecting NotFoundException
    });
  });

  describe('update', () => {
    it('should update and return a post', async () => {
      // const post = { id: 1, title: 'Old Title', category: { id: 2 } };
      const author = {
        id: 2,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const mockCategory = {
        id: 2,
        name: 'Test Category',
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const post = {
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }
      const updatePostDto: UpdatePostDto = {
        title: 'New Title',
        content: 'This is a test post',
        categoryId: 3
      };
      const updatedPost = {
        id: 1,
        title: 'New Title',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(postsService, 'findOne').mockResolvedValue(post as Post);
      jest.spyOn(categoryService, 'findOne').mockResolvedValue(mockCategory);
      jest.spyOn(postRepository, 'save').mockResolvedValue(updatedPost);

      expect(await postsService.update(1, updatePostDto)).toEqual(updatedPost);
    });

    it('should throw InternalServerErrorException if category is not found', async () => {
      jest.spyOn(categoryService, 'findOne').mockRejectedValue(new InternalServerErrorException());
      await expect(postsService.update(1, { title: 'New Title', content: "asdasd", categoryId: 2 })).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if post is not found', async () => {
      jest.spyOn(postsService, 'findOne').mockRejectedValue(new InternalServerErrorException());
      await expect(postsService.update(1, { title: 'New Title', content: "asdasd", categoryId: 2 })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      jest.spyOn(postRepository, 'delete').mockResolvedValue({ affected: 1, raw: {} } as any);

      await expect(postsService.remove(1)).resolves.toBeUndefined();
      expect(postRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerErrorException if post is not found', async () => {
      jest.spyOn(postRepository, 'delete').mockResolvedValue({ affected: 0, raw: {} } as any);

      await expect(postsService.remove(1)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
