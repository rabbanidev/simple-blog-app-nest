import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { AuthRequest } from 'src/interfaces';
import { AuthGuard } from 'src/modules/core/auth/auth.guard';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blo.dto';

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
}
