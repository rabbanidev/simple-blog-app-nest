import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from 'src/interfaces';
import { AuthGuard } from 'src/modules/core/auth/auth.guard';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PickHelper } from 'src/shared/utils/pick';
import { paginationFields } from 'src/shared/utils/constants';
import { GetBlogsDto } from './dto/get-blog.dto';

@Controller('/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Post('/create')
  async createBlog(
    @Req() req: AuthRequest,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    const result = await this.blogService.createBlog(createBlogDto, req.user);
    return {
      message: 'Blog created successfully',
      data: result,
    };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Patch('/update/:id')
  async updateBlog(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    const result = await this.blogService.updateBlog(
      id,
      updateBlogDto,
      req.user,
    );
    return {
      message: 'Blog updated successfully',
      data: result,
    };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Delete('/delete/:id')
  async deleteBlog(@Param('id') id: string, @Req() req: AuthRequest) {
    await this.blogService.deleteBlog(id, req.user);
    return {
      message: 'Blog deleted successfully',
    };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get('/my-blogs')
  async getMyBlogs(@Req() req: AuthRequest) {
    const result = await this.blogService.getMyBlogs(req.user);
    return {
      message: 'My blogs fetched successfully',
      data: result,
    };
  }

  @Get()
  async getBlogs(@Query() query: GetBlogsDto) {
    const paginationOptions = PickHelper.pick(
      query,
      paginationFields as readonly (keyof GetBlogsDto)[],
    );

    const filters = PickHelper.pick(query, ['search', 'author'] as const);

    const result = await this.blogService.getBlogs(filters, paginationOptions);
    return {
      message: 'Blogs fetched successfully',
      data: result,
    };
    return {
      message: 'Blogs fetched successfully',
      data: result,
    };
  }

  @Get('/:id')
  async getBlog(@Param('id') id: string) {
    const result = await this.blogService.getBlog(id);
    return {
      message: 'Blog fetched successfully',
      data: result,
    };
  }
}
