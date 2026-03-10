import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all published blog posts (public)' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  findAll(@Query('all') all?: string) {
    return this.blogService.findAll(all !== 'true');
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a single blog post by slug (public)' })
  findOne(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Roles('admin')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog post (admin only)' })
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Roles('admin')
  @Patch(':slug')
  @ApiOperation({ summary: 'Update a blog post (admin only)' })
  update(@Param('slug') slug: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(slug, dto);
  }

  @Roles('admin')
  @Delete(':slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a blog post (admin only)' })
  remove(@Param('slug') slug: string) {
    return this.blogService.remove(slug);
  }
}
