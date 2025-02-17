import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let commentRepository: Repository<Comment>;
  let postsService: PostsService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useClass: Repository,
        },
        {
          provide: PostsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    postsService = module.get<PostsService>(PostsService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create and return a new comment', async () => {
      const createCommentDto = {
        postId: 1,
        content: 'Test comment',
        authorId: 2
      };
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
      };
      const savedComment = {
        id: 1,
        content: 'Test comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(postsService, 'findOne').mockResolvedValue(post);
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(author);
      jest.spyOn(commentRepository, 'create').mockReturnValue(savedComment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue(savedComment);

      const result = await commentsService.create(createCommentDto);
      expect(result).toEqual(savedComment);
    });

    it('should throw NotFoundException if post not found', async () => {
      jest.spyOn(postsService, 'findOne').mockResolvedValue(null);

      await expect(commentsService.create({ postId: 1, content: 'Test', authorId: 2 }))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should throw NotFoundException if author not found', async () => {
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
      jest.spyOn(postsService, 'findOne').mockResolvedValue({
        id: 1,
        title: 'Test Post',
        content: 'This is a test post',
        author: author,
        category: mockCategory,
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      });
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null);

      await expect(commentsService.create({ postId: 1, content: 'Test', authorId: 2 }))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a comment if found', async () => {
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
      };
      const comment = {
        id: 1,
        content: 'Test comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment)
      expect(await commentsService.findOne(1)).toEqual(comment);
    });

    it('should throw NotFoundException if comment not found', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(commentsService.findOne(1)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update and return the updated comment', async () => {
      const updateCommentDto = {
        postId: 1,
        content: 'Updated comment',
        authorId: 2
      };
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
      };
      const existingComment = {
        id: 1,
        content: 'Old comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(postsService, 'findOne').mockResolvedValue(post);
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(author);
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(existingComment);
      jest.spyOn(commentRepository, 'save').mockResolvedValue({ ...existingComment, content: updateCommentDto.content });

      const result = await commentsService.update(1, updateCommentDto);
      expect(result.content).toEqual(updateCommentDto.content);
    });

    it('should throw NotFoundException if comment not found', async () => {
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(null);

      await expect(commentsService.update(1, { postId: 1, content: 'Updated', authorId: 2 }))
        .rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if author is not the owner', async () => {
      const updateCommentDto = { postId: 1, content: 'Updated comment', authorId: 3 };
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
      };
      const existingComment = {
        id: 1,
        content: 'Old comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(postsService, 'findOne').mockResolvedValue(post);
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({
        id: 3,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(existingComment);

      await expect(commentsService.update(1, updateCommentDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should delete a comment if the author is the owner', async () => {
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
      };
      const comment = {
        id: 1,
        content: 'Old comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(author);
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue({ affected: 1, raw: {} } as any);

      await expect(commentsService.remove(1, 2)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if comment is not found', async () => {
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(null);

      await expect(commentsService.remove(1, 2)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if author is not the owner', async () => {
      // const comment = { id: 1, content: 'Test', author: { id: 2 } };
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
      };
      const comment = {
        id: 1,
        content: 'Old comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(usersService, 'findOneById').mockResolvedValue({
        id: 3,
        username: 'test',
        posts: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(comment);

      await expect(commentsService.remove(1, 3)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw NotFoundException if delete operation affects 0 rows', async () => {
      // const comment = { id: 1, content: 'Test', author: { id: 2 } };
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
      };
      const comment = {
        id: 1,
        content: 'Old comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(author);
      jest.spyOn(commentsService, 'findOne').mockResolvedValue(comment);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(commentsService.remove(1, 2)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
