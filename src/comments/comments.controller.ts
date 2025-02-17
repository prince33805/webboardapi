import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return await this.commentsService.create(createCommentDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return await this.commentsService.update(+id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body('authorId') authorId: number) {
    return await this.commentsService.remove(+id, authorId);
  }
}
