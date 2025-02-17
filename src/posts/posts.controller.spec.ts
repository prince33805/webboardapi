import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByAuthor: jest.fn(),
            findPostAuthor: jest.fn(),
            findByAuthorCategory: jest.fn(),
            searchPosts: jest.fn(),
            findByCategory: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'This is a test',
        authorId: 1,
        categoryId: 2
      };

      const createdPost = {
        id: 1,
        title: createPostDto.title,
        content: createPostDto.content,
        author: {
          id: 1,
          username: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: [],
          comments: []
        },
        category: {
          id: 2,
          name: 'Food',
          posts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        comments: [],
        posts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null, // Ensure deletedAt is explicitly set 
      };

      jest.spyOn(postsService, 'create').mockResolvedValue(createdPost);

      const result = await controller.create(createPostDto);
      expect(result).toEqual(createdPost);
      expect(postsService.create).toHaveBeenCalledWith(createPostDto);
    });
  });

  // describe('findAll', () => {
  //   it('should return an array of posts', async () => {
  //     const mockPosts = [
  //       {
  //         id: 12,
  //         title: "foodtofash",
  //         content: "xzxczxczxc",
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //         deletedAt: null,
  //         author: {
  //           id: 2,
  //           username: "bbb222",
  //           posts: [],
  //           comments: [],
  //           createdAt: new Date(),
  //           updatedAt: new Date(),
  //           deletedAt: null
  //         },
  //         category: {
  //           id: 5,
  //           name: "Fashion",
  //           createdAt: new Date(),
  //           updatedAt: new Date(),
  //           deletedAt: null,
  //           posts: []
  //         },
  //         comments: []
  //       }
  //     ];
  //     jest.spyOn(postsService, 'findAll').mockResolvedValue(mockPosts);

  //     const result = await controller.findAll();
  //     expect(result).toEqual(mockPosts);
  //     expect(postsService.findAll).toHaveBeenCalled();
  //   });
  // });

  describe('findOne', () => {
    it('should return a post by ID', async () => {
      const mockPost = {
        id: 1,
        title: 'Test Post',
        content: "xzxczxczxc",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 2,
          username: "bbb222",
          posts: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        category: {
          id: 5,
          name: "Fashion",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: []
        },
        comments: []
      };
      jest.spyOn(postsService, 'findOne').mockResolvedValue(mockPost);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockPost);
      expect(postsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findPostAuthor', () => {
    it('should return posts by post,author ID', async () => {
      const mockPosts = {
        id: 1,
        title: 'Post 1',
        content: "xzxczxczxc",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 2,
          username: "bbb222",
          posts: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        category: {
          id: 5,
          name: "Fashion",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: []
        },
        comments: []
      };
      jest.spyOn(postsService, 'findPostAuthor').mockResolvedValue(mockPosts);

      const result = await controller.findPostAuthor("1","2");
      expect(result).toEqual(mockPosts);
      expect(postsService.findPostAuthor).toHaveBeenCalledWith(1,2);
    });
  });

  describe('searchPosts', () => {
    it('should return an array of posts', async () => {
      const mockPosts = [
        {
          id: 12,
          title: "foodtofash",
          content: "xzxczxczxc",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          author: {
            id: 2,
            username: "bbb222",
            posts: [],
            comments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          },
          category: {
            id: 5,
            name: "Fashion",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            posts: []
          },
          comments: []
        }
      ];
      jest.spyOn(postsService, 'searchPosts').mockResolvedValue(mockPosts);

      const result = await controller.searchPosts("");
      expect(result).toEqual(mockPosts);
      expect(postsService.searchPosts).toHaveBeenCalled();
    });
  });

  describe('findByAuthor', () => {
    it('should return posts by author ID', async () => {
      const mockPosts = [{
        id: 1,
        title: 'Post 1',
        content: "xzxczxczxc",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 2,
          username: "bbb222",
          posts: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        category: {
          id: 5,
          name: "Fashion",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: []
        },
        comments: []
      }];
      jest.spyOn(postsService, 'findByAuthor').mockResolvedValue(mockPosts);

      const result = await controller.findByAuthor("2","");
      expect(result).toEqual(mockPosts);
      expect(postsService.findByAuthor).toHaveBeenCalledWith(2,"");
    });
  });

  describe('findByAuthorCategory', () => {
    it('should return posts by author ID, Category Id', async () => {
      const mockPosts = [{
        id: 1,
        title: 'Post 1',
        content: "xzxczxczxc",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 2,
          username: "bbb222",
          posts: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        category: {
          id: 5,
          name: "Fashion",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: []
        },
        comments: []
      }];
      jest.spyOn(postsService, 'findByAuthorCategory').mockResolvedValue(mockPosts);

      const result = await controller.findByAuthorCategory("2","2","");
      expect(result).toEqual(mockPosts);
      expect(postsService.findByAuthorCategory).toHaveBeenCalledWith(2,2,"");
    });
  });

  describe('findByCategory', () => {
    it('should return posts by Category ID', async () => {
      const mockPosts = [{
        id: 1,
        title: 'Post 1',
        content: "xzxczxczxc",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: 2,
          username: "bbb222",
          posts: [],
          comments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        },
        category: {
          id: 5,
          name: "Fashion",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: []
        },
        comments: []
      }];
      jest.spyOn(postsService, 'findByCategory').mockResolvedValue(mockPosts);

      const result = await controller.findByCategory("2","");
      expect(result).toEqual(mockPosts);
      expect(postsService.findByCategory).toHaveBeenCalledWith(2,"");
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        content: "xzxczxczxc",
        categoryId: 1
      };
      const updatedPost = {
        id: 1,
        title: 'Updated Title',
        content: "xzxczxczxc",
        author: {
          id: 1,
          username: 'test',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          posts: [],
          comments: []
        },
        category: {
          id: 1,
          name: 'History',
          posts: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null, // Ensure deletedAt is explicitly set 
      };

      jest.spyOn(postsService, 'update').mockResolvedValue(updatedPost);

      const result = await controller.update('1', updatePostDto);
      expect(result).toEqual(updatedPost);
      expect(postsService.update).toHaveBeenCalledWith(1, updatePostDto);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      jest.spyOn(postsService, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');
      expect(result).toBeUndefined();
      expect(postsService.remove).toHaveBeenCalledWith(1);
    });
  });
});
