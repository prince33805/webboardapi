import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsController = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const createCommentDto: CreateCommentDto = { postId: 1, content: 'Test comment', authorId: 2 };
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
      const result = {
        id: 1,
        content: 'Test comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      // const result = { id: 1, ...createCommentDto };

      jest.spyOn(commentsService, 'create').mockResolvedValue(result);

      expect(await commentsController.create(createCommentDto)).toEqual(result);
      expect(commentsService.create).toHaveBeenCalledWith(createCommentDto);
    });
  });

  describe('findOne', () => {
    it('should return a comment when found', async () => {
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

      jest.spyOn(commentsService, 'findOne').mockResolvedValue(comment);

      expect(await commentsController.findOne('1')).toEqual(comment);
      expect(commentsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      jest.spyOn(commentsService, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(commentsController.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated comment', async () => {
      const updateCommentDto: UpdateCommentDto = { postId: 1, content: 'Updated comment', authorId: 2 };
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
      const updatedComment = {
        id: 1,
        // ...updateCommentDto,
        content: 'Updated comment',
        post,
        author,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(commentsService, 'update').mockResolvedValue(updatedComment);

      expect(await commentsController.update('1', updateCommentDto)).toEqual(updatedComment);
      expect(commentsService.update).toHaveBeenCalledWith(1, updateCommentDto);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      jest.spyOn(commentsService, 'update').mockRejectedValue(new NotFoundException());

      await expect(commentsController.update('1', { postId: 1, content: 'Updated', authorId: 2 }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a comment successfully', async () => {
      jest.spyOn(commentsService, 'remove').mockResolvedValue(undefined);

      await expect(commentsController.remove('1', 2)).resolves.toBeUndefined();
      expect(commentsService.remove).toHaveBeenCalledWith(1, 2);
    });

    it('should throw NotFoundException if comment is not found', async () => {
      jest.spyOn(commentsService, 'remove').mockRejectedValue(new NotFoundException());

      await expect(commentsController.remove('1', 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if author is not the owner', async () => {
      jest.spyOn(commentsService, 'remove').mockRejectedValue(new InternalServerErrorException());

      await expect(commentsController.remove('1', 3)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
