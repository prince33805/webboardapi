import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) { }

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    try {
      const { postId, content, authorId } = createCommentDto;

      // Find the post by ID
      const post = await this.postsService.findOne(postId);
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Find the author by ID
      const author = await this.usersService.findOneById(authorId);
      if (!author) {
        throw new NotFoundException(`User with ID ${authorId} not found`);
      }

      // Create and save the comment
      const newComment = this.commentRepository.create({
        post,
        content,
        author,
      });

      return await this.commentRepository.save(newComment);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to create comment');
    }
  }


  async findOne(id: number): Promise<Comment | null> {
    try {
      const comment = await this.commentRepository.findOne({ where: { id } });
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }
      return comment;
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error retrieving comment');
    }
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    try {
      const { postId, content, authorId } = updateCommentDto;
      const post = await this.postsService.findOne(postId);
      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      // Find the author by ID
      const author = await this.usersService.findOneById(authorId);
      if (!author) {
        throw new NotFoundException(`User with ID ${authorId} not found`);
      }

      const comment = await this.findOne(id);
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      if (comment.author.id == author.id) {
        Object.assign(comment, {
          post,
          content,
          author,
        });
      } else {
        throw new InternalServerErrorException('You are not allow to edit this comment');
      }

      return await this.commentRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error to update comment');
    }
  }

  async remove(id: number, authorId: number): Promise<void> {
    try {
      const author = await this.usersService.findOneById(authorId);
      if (!author) {
        throw new NotFoundException(`User with ID ${authorId} not found`);
      }

      const comment = await this.findOne(id);
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      if (comment.author.id == author.id) {
        const result = await this.commentRepository.delete(id);
        if (result.affected === 0) {
          throw new NotFoundException(`Comment with ID ${id} not found`);
        }
      } else {
        throw new InternalServerErrorException('You are not allow to delete this comment');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Error to delete comment');
    }
  }
}
