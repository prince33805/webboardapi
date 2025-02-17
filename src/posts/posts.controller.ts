import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(createPostDto);
  }

  // @Get()
  // async findAll() {
  //   return await this.postsService.findAll();
  // }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // console.log("id",id)
    return await this.postsService.findOne(+id);
  }

  @Get(':id/author/:authorId')
  async findPostAuthor(@Param('id') id: string,@Param('authorId') authorId: string) {
    // console.log("id",id)
    return await this.postsService.findPostAuthor(+id,+authorId);
  }

  @Get()
  async searchPosts(@Query('search') search: string) {
    return this.postsService.searchPosts(search);
  }

  @Get('author/:id')
  async findByAuthor(@Param('id') id: string, @Query('search') search: string) {
    // console.log("id",id)
    return await this.postsService.findByAuthor(+id, search);
  }

  @Get('author/:id/category/:categoryId')
  async findByAuthorCategory(@Param('id') id: string, @Param('categoryId') categoryId: string, @Query('search') search: string) {
    // console.log("id",id)
    return await this.postsService.findByAuthorCategory(+id, +categoryId, search);
  }

  @Get('category/:id')
  async findByCategory(@Param('id') id: string, @Query('search') search: string) {
    // console.log("id",id)
    return await this.postsService.findByCategory(+id, search);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.postsService.remove(+id);
  }
}
